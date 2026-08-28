from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from risk_engine import RiskEngine
from cluster_detection import ClusterDetector
from chat_engine import ChatEngine
from image_detector import ImageDetector
from weather_service import WeatherService
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="PashuRaksha AI Service", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()
cluster_detector = ClusterDetector()
chat_engine = ChatEngine()
image_detector = ImageDetector()
weather_service = WeatherService()


# --- Models ---

class CaseData(BaseModel):
    id: int
    latitude: float
    longitude: float
    symptoms: List[str]
    severity: str
    reported_at: str
    village: str
    block: str
    district: str


class RiskRequest(BaseModel):
    case: CaseData
    nearby_cases: List[CaseData]


class ClusterRequest(BaseModel):
    cases: List[CaseData]
    radius_km: float = 5.0


class ChatRequest(BaseModel):
    message: str
    animal_type: Optional[str] = None
    conversation_id: Optional[str] = None


class FusionRequest(BaseModel):
    """Combined image + text analysis request."""
    message: Optional[str] = None
    animal_type: Optional[str] = None
    conversation_id: Optional[str] = None
    # Image prediction results (passed from frontend after image detection)
    image_prediction: Optional[str] = None
    image_confidence: Optional[float] = None


# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pashuraksha-ai", "version": "2.1.0"}


@app.post("/api/v1/risk/calculate")
async def calculate_risk(request: RiskRequest):
    risk = risk_engine.calculate_risk(request.case, request.nearby_cases)
    return risk


@app.post("/api/v1/risk/clusters")
async def detect_clusters(request: ClusterRequest):
    clusters = cluster_detector.detect_clusters(request.cases, request.radius_km)
    return {"clusters": clusters}


@app.post("/api/v1/risk/batch")
async def batch_risk(request: RiskRequest):
    risk = risk_engine.calculate_risk(request.case, request.nearby_cases)
    return {"risk": risk}


@app.post("/api/v1/chat/advisory")
async def chat_advisory(request: ChatRequest):
    result = chat_engine.analyze(
        request.message,
        request.animal_type,
        request.conversation_id
    )
    return result


@app.post("/api/v1/detect/image")
async def detect_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    if not image_bytes:
        return {"error": "Empty file", "prediction": None}
    result = image_detector.predict(image_bytes)
    result["filename"] = file.filename
    result["file_size_kb"] = round(len(image_bytes) / 1024, 1)
    return result


@app.post("/api/v1/diagnose/fusion")
async def diagnose_fusion(request: FusionRequest):
    """
    Combined diagnosis: merges image detection + symptom chat analysis.
    Produces a unified diagnosis with higher confidence than either alone.
    """
    chat_result = None
    image_result = None

    # Run chat analysis if message provided
    if request.message:
        chat_result = chat_engine.analyze(
            request.message,
            request.animal_type,
            request.conversation_id
        )

    # Use image prediction if provided
    if request.image_prediction:
        image_result = {
            "prediction": request.image_prediction,
            "confidence": request.image_confidence or 0.0,
        }

    # Fusion logic
    if chat_result and image_result:
        return _fuse_predictions(chat_result, image_result)
    elif chat_result:
        chat_result["fusion_source"] = "text_only"
        return chat_result
    elif image_result:
        return {
            "probable_disease": image_result["prediction"],
            "confidence": image_result["confidence"],
            "risk_level": "HIGH" if image_result["confidence"] > 0.7 else "MEDIUM",
            "fusion_source": "image_only",
            "immediate_actions": ["Confirm with veterinary examination"],
            "should_report": True,
            "detected_symptoms": [],
            "differential_diagnosis": [],
            "algorithm": "fusion-v1"
        }
    else:
        return {"error": "Provide either message or image_prediction"}


def _fuse_predictions(chat_result: dict, image_result: dict) -> dict:
    """Merge image and chat predictions into a unified diagnosis."""
    chat_disease = chat_result.get("probable_disease") or ""
    image_disease = image_result.get("prediction") or ""
    chat_conf = chat_result.get("confidence", 0.0)
    image_conf = image_result.get("confidence", 0.0)

    # Case 1: Both agree on same disease
    chat_normalized = chat_disease.lower().replace(" ", "_")
    image_normalized = image_disease.lower().replace(" ", "_")

    agreement = (
        ("foot" in chat_normalized and "foot" in image_normalized) or
        ("lumpy" in chat_normalized and "lumpy" in image_normalized) or
        ("mastitis" in chat_normalized and "mastitis" in image_normalized) or
        (chat_normalized == image_normalized)
    )

    if agreement:
        # Both agree → boost confidence significantly
        fused_confidence = min(0.98, (chat_conf * 0.5 + image_conf * 0.5) + 0.15)
        result = dict(chat_result)
        result["confidence"] = round(fused_confidence, 3)
        result["fusion_source"] = "agreement"
        result["fusion_detail"] = f"Image ({image_disease}, {int(image_conf*100)}%) confirms text analysis"
        return result
    else:
        # Disagree → report both, weight by confidence
        if image_conf > chat_conf + 0.2:
            # Image significantly more confident
            result = dict(chat_result)
            result["probable_disease"] = image_disease
            result["confidence"] = round(image_conf * 0.7 + chat_conf * 0.3, 3)
            result["fusion_source"] = "image_dominant"
            result["fusion_detail"] = (
                f"Image analysis suggests {image_disease} ({int(image_conf*100)}%), "
                f"but symptoms suggest {chat_disease} ({int(chat_conf*100)}%). "
                f"Recommend veterinary confirmation."
            )
            # Include chat disease in differential
            if result.get("differential_diagnosis") is None:
                result["differential_diagnosis"] = []
            result["differential_diagnosis"].insert(0, {
                "disease": chat_disease,
                "confidence": chat_conf,
                "reason": "Symptom-based analysis"
            })
            return result
        else:
            # Chat dominant or similar confidence — trust symptoms
            result = dict(chat_result)
            result["confidence"] = round(chat_conf * 0.6 + image_conf * 0.4, 3)
            result["fusion_source"] = "text_dominant"
            result["fusion_detail"] = (
                f"Symptoms strongly suggest {chat_disease} ({int(chat_conf*100)}%). "
                f"Image shows {image_disease} ({int(image_conf*100)}%). "
                f"Clinical symptoms take priority for diagnosis."
            )
            return result


# --- Weather Endpoints ---

@app.get("/api/v1/weather")
async def get_weather(district: str = Query(default="Palghar"), days: int = Query(default=7)):
    """Get current weather + forecast for a district."""
    return weather_service.get_weather(district, days)


@app.get("/api/v1/weather/correlation")
async def get_weather_correlation(district: str = Query(default="Palghar")):
    """Get disease-weather risk correlation analysis for a district."""
    return weather_service.get_disease_correlation(district)


@app.get("/api/v1/weather/districts")
async def get_available_districts():
    """List all districts with coordinates available for weather analysis."""
    from weather_service import DISTRICT_COORDS
    return {
        "districts": [
            {"name": k.title(), "code": k, "latitude": v["lat"], "longitude": v["lng"]}
            for k, v in DISTRICT_COORDS.items() if k != "default"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

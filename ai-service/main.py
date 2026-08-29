from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from risk_engine import RiskEngine
from cluster_detection import ClusterDetector
from chat_engine import ChatEngine
from image_detector import ImageDetector
from weather_service import WeatherService
from treatment_protocols import get_treatment_protocol
from outbreak_intelligence import OutbreakIntelligence
from llm_service import LLMService
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="PashuRaksha AI Service", version="2.2.0")

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
outbreak_intel = OutbreakIntelligence()
llm_service = LLMService()


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
    language: Optional[str] = "en-IN"


class FusionRequest(BaseModel):
    """Combined image + text analysis request."""
    message: Optional[str] = None
    animal_type: Optional[str] = None
    conversation_id: Optional[str] = None
    image_prediction: Optional[str] = None
    image_confidence: Optional[float] = None


class CompleteDiagnosisRequest(BaseModel):
    """Full diagnosis request with all context for complete intelligence."""
    message: Optional[str] = None
    animal_type: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    farm_animal_count: Optional[int] = 0
    image_prediction: Optional[str] = None
    image_confidence: Optional[float] = None
    conversation_id: Optional[str] = None
    language: Optional[str] = "en-IN"


# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "pashuraksha-ai",
        "version": "2.2.0",
        "llm": llm_service.status(),
    }


@app.get("/api/v1/llm/status")
async def llm_status():
    return llm_service.status()


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
    # LLM enhancement: rephrase in the farmer's language (falls back to rule-based)
    if result.get("probable_disease"):
        result = llm_service.enhance_diagnosis(
            result, request.language or "en-IN", request.message
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


# --- Complete Diagnosis Endpoint (combines ALL intelligence) ---

@app.post("/api/v1/diagnose/complete")
async def diagnose_complete(request: CompleteDiagnosisRequest):
    """
    THE flagship endpoint — combines:
    - Symptom analysis (chat engine)
    - Image prediction (if provided)
    - Treatment protocol (drugs, first aid, timeline)
    - Outbreak intelligence (area cases, vaccination, weather, herd risk)
    
    This is what makes PashuRaksha unique: not just detection, but full situational awareness.
    """
    result = {}

    # 1. Disease identification (from symptoms or image)
    disease_name = None
    confidence = 0.0
    risk_level = "UNKNOWN"

    if request.message:
        chat_result = chat_engine.analyze(request.message, request.animal_type, request.conversation_id)
        disease_name = chat_result.get("probable_disease")
        confidence = chat_result.get("confidence", 0.0)
        risk_level = chat_result.get("risk_level", "UNKNOWN")
        result["diagnosis"] = chat_result
    
    if request.image_prediction:
        img_disease = request.image_prediction
        img_conf = request.image_confidence or 0.0
        
        if disease_name and img_disease:
            # Fusion: if both agree, boost confidence
            chat_norm = (disease_name or "").lower()
            img_norm = img_disease.lower()
            if any(word in img_norm for word in chat_norm.split()[:2]):
                confidence = min(0.98, confidence * 0.5 + img_conf * 0.5 + 0.15)
                result["fusion"] = "agreement"
            else:
                result["fusion"] = "text_dominant" if confidence > img_conf else "image_dominant"
                if img_conf > confidence:
                    disease_name = img_disease
                    confidence = img_conf
        elif not disease_name:
            disease_name = img_disease
            confidence = img_conf
            risk_level = "HIGH" if img_conf > 0.7 else "MEDIUM"
        
        result["image_analysis"] = {"prediction": img_disease, "confidence": img_conf}

    if not disease_name:
        return {
            "error": "Could not identify disease. Describe symptoms or upload a clearer image.",
            "diagnosis": None,
        }

    result["identified_disease"] = disease_name
    result["confidence"] = round(confidence, 3)
    result["risk_level"] = risk_level

    # 2. Treatment protocol
    treatment = get_treatment_protocol(disease_name)
    result["treatment"] = treatment

    # 3. Outbreak intelligence (area context)
    district = request.district or "Palghar"
    intel = outbreak_intel.get_area_intelligence(
        district=district,
        disease=disease_name,
        latitude=request.latitude,
        longitude=request.longitude,
        farm_animal_count=request.farm_animal_count or 10,
    )
    result["intelligence"] = intel

    # 4. Action summary (what should happen RIGHT NOW)
    result["action_summary"] = _build_action_summary(disease_name, risk_level, intel, treatment)

    # 5. LLM enhancement — natural-language summary in farmer's language.
    #    Rule-based facts stay authoritative; LLM only rephrases. Falls back gracefully.
    enhanced = llm_service.enhance_diagnosis(
        result, request.language or "en-IN", request.message or ""
    )
    result["natural_response"] = enhanced.get("response") if enhanced.get("response_source", "").startswith("gemini") else None
    result["response_source"] = enhanced.get("response_source", "rule-based")

    return result


def _build_action_summary(disease: str, risk_level: str, intel: dict, treatment: dict) -> dict:
    """Build prioritized action list based on all intelligence."""
    actions = []
    urgency = "ROUTINE"

    # Immediate actions from treatment
    if treatment.get("available") and treatment.get("first_aid"):
        actions.extend([{"priority": "NOW", "action": fa} for fa in treatment["first_aid"][:3]])

    # Outbreak-driven actions
    outbreak = intel.get("outbreak_status", {})
    if outbreak.get("level") in ("CRITICAL", "HIGH"):
        urgency = "EMERGENCY"
        actions.insert(0, {"priority": "EMERGENCY", "action": "Report to veterinary authority IMMEDIATELY — outbreak detected in your area"})
    elif risk_level in ("CRITICAL", "HIGH"):
        urgency = "URGENT"
        actions.insert(0, {"priority": "URGENT", "action": "Contact veterinarian within 24 hours"})

    # Vaccination gap action
    vac = intel.get("vaccination_status", {})
    if vac.get("status") in ("BELOW_THRESHOLD", "CRITICALLY_LOW"):
        actions.append({"priority": "IMPORTANT", "action": f"Area vaccination coverage is {vac.get('coverage_percent', 0)}% — below 80% threshold. Request vaccination drive."})

    # Herd isolation action
    herd = intel.get("herd_risk", {})
    if herd.get("risk_level") in ("CRITICAL", "HIGH"):
        actions.append({"priority": "NOW", "action": herd.get("message", "Isolate affected animal immediately")})

    return {
        "urgency": urgency,
        "actions": actions[:8],
        "auto_report_recommended": risk_level in ("CRITICAL", "HIGH") or outbreak.get("level") in ("CRITICAL", "HIGH"),
    }


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

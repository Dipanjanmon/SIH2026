from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from risk_engine import RiskEngine
from cluster_detection import ClusterDetector
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="PashuRaksha AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()
cluster_detector = ClusterDetector()


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


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pashuraksha-ai"}


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

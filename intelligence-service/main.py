from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN

app = FastAPI(title="PashuRaksha Intelligence Service")

class RiskRequest(BaseModel):
    symptom_severity: int
    affected_count: int
    mortality: bool
    vaccination_gap: bool

class CasePoint(BaseModel):
    case_id: str
    latitude: float
    longitude: float

class ClusterRequest(BaseModel):
    cases: List[CasePoint]
    radius_km: float = 5.0
    minimum_cases: int = 3

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "pashuraksha-intelligence"}

@app.post("/risk/individual")
def calculate_individual_risk(request: RiskRequest):
    score = 0
    factors = []
    
    if request.mortality:
        score += 30
        factors.append("Mortality reported")
    if request.affected_count > 5:
        score += 20
        factors.append("Multiple affected animals")
        
    level = "LOW"
    if score >= 75:
        level = "CRITICAL"
    elif score >= 50:
        level = "HIGH"
    elif score >= 25:
        level = "MODERATE"
        
    return {
        "score": score,
        "level": level,
        "factors": factors,
        "algorithmVersion": "rules-v1"
    }

@app.post("/clusters/detect")
def detect_clusters(request: ClusterRequest):
    if not request.cases or len(request.cases) < request.minimum_cases:
        return {"clusters": []}

    df = pd.DataFrame([c.model_dump() for c in request.cases])
    
    kms_per_radian = 6371.0088
    epsilon = request.radius_km / kms_per_radian

    coords = np.radians(df[['latitude', 'longitude']])
    db = DBSCAN(eps=epsilon, min_samples=request.minimum_cases, algorithm='ball_tree', metric='haversine').fit(coords)
    df['cluster_label'] = db.labels_
    
    clusters = []
    for label in set(db.labels_):
        if label == -1:
            continue
            
        cluster_points = df[df['cluster_label'] == label]
        
        center_lat = cluster_points['latitude'].mean()
        center_lng = cluster_points['longitude'].mean()
        case_ids = cluster_points['case_id'].tolist()
        
        risk_score = min(50 + (len(case_ids) * 5), 100)
        risk_level = "CRITICAL" if risk_score >= 75 else "HIGH"

        clusters.append({
            "clusterId": f"CL-AUTO-{label}",
            "centerLatitude": center_lat,
            "centerLongitude": center_lng,
            "radiusKm": request.radius_km,
            "caseCount": len(case_ids),
            "memberCaseIds": case_ids,
            "riskScore": risk_score,
            "riskLevel": risk_level
        })

    return {"clusters": clusters}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

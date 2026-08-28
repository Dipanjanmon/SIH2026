from typing import List, Dict
import math
from datetime import datetime, timedelta


class RiskEngine:
    SYMPTOM_WEIGHTS = {
        "fever": 0.3,
        "salivation": 0.4,
        "limping": 0.25,
        "diarrhea": 0.2,
        "coughing": 0.2,
        "reduced_appetite": 0.15,
        "oral_lesions": 0.45,
        "skin_lesions": 0.35,
        "nasal_discharge": 0.3,
        "eye_discharge": 0.25,
        "milk_reduction": 0.3,
        "abortion": 0.5,
        "sudden_death": 0.8,
        "swelling": 0.35,
        "lameness": 0.2,
        "weight_loss": 0.15,
        "restlessness": 0.1,
    }

    def calculate_risk(self, case_data, nearby_cases) -> Dict:
        symptom_score = self._symptom_risk(case_data.symptoms)
        proximity_score = self._proximity_risk(case_data, nearby_cases)
        temporal_score = self._temporal_risk(nearby_cases)
        growth_score = self._growth_risk(nearby_cases)

        total_score = (
            symptom_score * 0.35
            + proximity_score * 0.25
            + temporal_score * 0.20
            + growth_score * 0.20
        )

        risk_level = self._score_to_level(total_score)

        return {
            "risk_score": round(total_score * 100, 1),
            "risk_level": risk_level,
            "factors": {
                "symptom_risk": round(symptom_score * 100, 1),
                "proximity_risk": round(proximity_score * 100, 1),
                "temporal_risk": round(temporal_score * 100, 1),
                "growth_risk": round(growth_score * 100, 1),
            },
            "similar_cases_count": len(nearby_cases),
            "recommendation": self._get_recommendation(risk_level, len(nearby_cases)),
        }

    def _symptom_risk(self, symptoms: List[str]) -> float:
        if not symptoms:
            return 0.1
        weights = [self.SYMPTOM_WEIGHTS.get(s.lower(), 0.1) for s in symptoms]
        return min(sum(weights) / len(weights) * 1.5, 1.0)

    def _proximity_risk(self, case_data, nearby_cases) -> float:
        if not nearby_cases:
            return 0.0
        distances = []
        for nc in nearby_cases:
            dist = self._haversine(
                case_data.latitude, case_data.longitude,
                nc.latitude, nc.longitude
            )
            distances.append(dist)
        nearby_count = sum(1 for d in distances if d <= 5.0)
        return min(nearby_count / 10.0, 1.0)

    def _temporal_risk(self, nearby_cases) -> float:
        if not nearby_cases:
            return 0.0
        now = datetime.utcnow()
        recent = sum(
            1 for c in nearby_cases
            if (now - datetime.fromisoformat(c.reported_at.replace("Z", ""))).days <= 7
        )
        return min(recent / 10.0, 1.0)

    def _growth_risk(self, nearby_cases) -> float:
        if len(nearby_cases) < 4:
            return 0.1
        now = datetime.utcnow()
        week1 = sum(
            1 for c in nearby_cases
            if 0 <= (now - datetime.fromisoformat(c.reported_at.replace("Z", ""))).days <= 7
        )
        week2 = sum(
            1 for c in nearby_cases
            if 7 < (now - datetime.fromisoformat(c.reported_at.replace("Z", ""))).days <= 14
        )
        if week2 == 0:
            return 0.8 if week1 > 0 else 0.1
        growth = (week1 - week2) / week2
        return min(max(growth, 0.0), 1.0)

    def _haversine(self, lat1, lon1, lat2, lon2) -> float:
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2
             + math.cos(math.radians(lat1))
             * math.cos(math.radians(lat2))
             * math.sin(dlon / 2) ** 2)
        return R * 2 * math.asin(math.sqrt(a))

    def _score_to_level(self, score: float) -> str:
        if score >= 0.75:
            return "CRITICAL"
        elif score >= 0.5:
            return "HIGH"
        elif score >= 0.25:
            return "MEDIUM"
        return "LOW"

    def _get_recommendation(self, level: str, count: int) -> str:
        recommendations = {
            "CRITICAL": f"IMMEDIATE ACTION REQUIRED. {count} similar cases detected. Deploy veterinary team. Consider quarantine zone.",
            "HIGH": f"HIGH RISK. {count} similar cases nearby. Assign veterinarian. Collect samples for lab testing.",
            "MEDIUM": f"MODERATE RISK. {count} related cases. Monitor closely. Vaccination recommended.",
            "LOW": f"LOW RISK. {count} cases in area. Continue monitoring.",
        }
        return recommendations.get(level, "Insufficient data for assessment.")

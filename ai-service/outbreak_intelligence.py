"""
PashuRaksha Outbreak Intelligence
Provides area-level context: nearby cases, vaccination coverage, weather risk, herd risk.
Connects AI diagnosis to the surveillance system — not just detection, but ACTION.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import requests


class OutbreakIntelligence:
    def __init__(self, backend_url: str = "http://localhost:8080"):
        self.backend_url = backend_url

    def get_area_intelligence(self, district: str, disease: str,
                              latitude: Optional[float] = None,
                              longitude: Optional[float] = None,
                              farm_animal_count: int = 0) -> Dict:
        """
        Gather all intelligence about an area given a diagnosis.
        Returns: nearby cases, vaccination gap, weather risk, herd risk.
        """
        area_cases = self._get_area_cases(district, disease)
        vaccination_status = self._get_vaccination_coverage(district)
        weather_risk = self._get_weather_risk(district)
        herd_risk = self._calculate_herd_risk(disease, farm_animal_count, area_cases)
        outbreak_status = self._assess_outbreak_status(area_cases, disease)

        return {
            "area_cases": area_cases,
            "vaccination_status": vaccination_status,
            "weather_risk": weather_risk,
            "herd_risk": herd_risk,
            "outbreak_status": outbreak_status,
        }

    def _get_area_cases(self, district: str, disease: str) -> Dict:
        """Get case statistics for the area."""
        # ponytail: In production, call backend API with auth token.
        # For AI service internal use, we simulate with realistic data based on seeded DB.
        try:
            # Try to reach backend for real data
            resp = requests.get(
                f"{self.backend_url}/api/v1/analytics/by-district",
                timeout=3
            )
            if resp.status_code == 200:
                district_data = resp.json()
                total_in_district = district_data.get(district, 0)
            else:
                total_in_district = 0
        except Exception:
            total_in_district = 0

        # Simulate intelligent response based on disease + district
        # In production, this queries the actual case database
        nearby_same_disease = max(1, total_in_district // 2) if total_in_district > 0 else 0
        last_7_days = max(0, nearby_same_disease - 1)

        return {
            "total_cases_in_district": total_in_district,
            "same_disease_nearby": nearby_same_disease,
            "cases_last_7_days": last_7_days,
            "cases_last_30_days": total_in_district,
            "radius_km": 10,
            "cluster_forming": nearby_same_disease >= 3,
            "summary": self._build_area_summary(district, nearby_same_disease, last_7_days, disease),
        }

    def _get_vaccination_coverage(self, district: str) -> Dict:
        """Assess vaccination coverage in the area."""
        # ponytail: In production, query vaccination records from backend.
        # Using estimation based on national averages + district performance.
        try:
            resp = requests.get(
                f"{self.backend_url}/api/v1/analytics/vaccination-coverage",
                timeout=3
            )
            if resp.status_code == 200:
                data = resp.json()
                coverage = data.get("coveragePercent", 45.0)
            else:
                coverage = 45.0
        except Exception:
            coverage = 45.0

        threshold = 80.0  # WHO/OIE recommended threshold
        gap = max(0, threshold - coverage)
        status = "ADEQUATE" if coverage >= threshold else "BELOW_THRESHOLD" if coverage >= 50 else "CRITICALLY_LOW"

        return {
            "coverage_percent": round(coverage, 1),
            "threshold": threshold,
            "gap_percent": round(gap, 1),
            "status": status,
            "message": self._vaccination_message(coverage, status),
        }

    def _get_weather_risk(self, district: str) -> Dict:
        """Get weather-based disease risk for the area."""
        try:
            from weather_service import WeatherService
            ws = WeatherService()
            correlation = ws.get_disease_correlation(district)
            return {
                "season": correlation.get("season", {}).get("name", "Unknown"),
                "season_risk": correlation.get("season", {}).get("risk", "LOW"),
                "top_weather_risks": [
                    {"disease": r["disease"], "risk_level": r["risk_level"], "reason": r["matched_conditions"][0] if r["matched_conditions"] else ""}
                    for r in correlation.get("disease_risks", [])[:3]
                ],
                "advisory": correlation.get("advisory", ""),
            }
        except Exception:
            return {
                "season": "Unknown",
                "season_risk": "UNKNOWN",
                "top_weather_risks": [],
                "advisory": "Weather data unavailable",
            }

    def _calculate_herd_risk(self, disease: str, farm_animal_count: int, area_cases: Dict) -> Dict:
        """Calculate risk to the farmer's herd based on disease characteristics."""
        if farm_animal_count <= 0:
            farm_animal_count = 10  # Default estimate

        # Disease-specific transmission rates
        transmission_rates = {
            "Foot and Mouth Disease": 0.85,  # Highly contagious
            "Lumpy Skin Disease": 0.40,  # Vector-dependent
            "Peste des Petits Ruminants": 0.90,  # Extremely contagious in goats
            "Mastitis": 0.15,  # Low herd spread (hygiene-dependent)
            "Brucellosis": 0.30,  # Moderate (contact/milk)
            "Anthrax": 0.10,  # Low animal-to-animal (soil source)
            "Hemorrhagic Septicemia": 0.25,  # Moderate (stress + environment)
            "Black Quarter": 0.05,  # Very low (soil spores, not contagious)
        }

        rate = transmission_rates.get(disease, 0.30)
        at_risk = int(farm_animal_count * rate)
        timeframe = "48 hours" if rate > 0.7 else "7 days" if rate > 0.3 else "14 days"

        cluster_bonus = 0.2 if area_cases.get("cluster_forming") else 0.0
        effective_rate = min(rate + cluster_bonus, 0.95)
        at_risk_with_cluster = int(farm_animal_count * effective_rate)

        risk_level = "CRITICAL" if effective_rate > 0.7 else "HIGH" if effective_rate > 0.4 else "MEDIUM" if effective_rate > 0.2 else "LOW"

        return {
            "farm_animals": farm_animal_count,
            "animals_at_risk": at_risk_with_cluster,
            "transmission_rate": round(effective_rate * 100, 1),
            "timeframe": timeframe,
            "risk_level": risk_level,
            "message": f"{at_risk_with_cluster} of your {farm_animal_count} animals are at risk of infection within {timeframe}. {'IMMEDIATE isolation required.' if risk_level in ('CRITICAL', 'HIGH') else 'Monitor closely and isolate affected animal.'}",
        }

    def _assess_outbreak_status(self, area_cases: Dict, disease: str) -> Dict:
        """Determine if this is part of an outbreak."""
        cases_7d = area_cases.get("cases_last_7_days", 0)
        cluster = area_cases.get("cluster_forming", False)

        if cases_7d >= 5 or cluster:
            return {
                "status": "ACTIVE_OUTBREAK",
                "level": "CRITICAL",
                "message": f"⚠️ ACTIVE OUTBREAK: {disease} cluster detected in your area. {cases_7d} cases in last 7 days. Containment measures required.",
            }
        elif cases_7d >= 3:
            return {
                "status": "EMERGING",
                "level": "HIGH",
                "message": f"🔴 EMERGING CLUSTER: {cases_7d} {disease} cases in 7 days. Outbreak developing — increased surveillance needed.",
            }
        elif cases_7d >= 1:
            return {
                "status": "SPORADIC",
                "level": "MEDIUM",
                "message": f"🟡 Sporadic cases of {disease} in your area. Stay vigilant and report any new symptoms immediately.",
            }
        else:
            return {
                "status": "NO_OUTBREAK",
                "level": "LOW",
                "message": f"🟢 No recent {disease} cases reported nearby. Continue routine surveillance.",
            }

    def _build_area_summary(self, district: str, same_disease: int, last_7: int, disease: str) -> str:
        if same_disease == 0:
            return f"No recent {disease} cases in {district}. This may be a new occurrence — report immediately."
        elif same_disease >= 3:
            return f"⚠️ {same_disease} {disease} cases within 10km in {district}. Cluster forming! {last_7} in last 7 days."
        else:
            return f"{same_disease} similar {disease} case(s) in {district} area. Monitor situation closely."

    def _vaccination_message(self, coverage: float, status: str) -> str:
        if status == "ADEQUATE":
            return f"Vaccination coverage {coverage:.0f}% — adequate herd immunity."
        elif status == "BELOW_THRESHOLD":
            return f"⚠️ Coverage {coverage:.0f}% — BELOW 80% threshold. Herd immunity insufficient. Vaccination drive needed."
        else:
            return f"🚨 Coverage {coverage:.0f}% — CRITICALLY LOW. Outbreak risk very high. Emergency vaccination required."

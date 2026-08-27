from typing import List, Dict
import math
from collections import defaultdict


class ClusterDetector:
    def detect_clusters(self, cases: List, radius_km: float = 5.0) -> List[Dict]:
        if not cases:
            return []

        visited = set()
        clusters = []

        for i, case in enumerate(cases):
            if i in visited:
                continue

            cluster_cases = [case]
            visited.add(i)

            for j, other in enumerate(cases):
                if j in visited:
                    continue
                dist = self._haversine(
                    case.latitude, case.longitude,
                    other.latitude, other.longitude
                )
                if dist <= radius_km:
                    cluster_cases.append(other)
                    visited.add(j)

            if len(cluster_cases) >= 3:
                cluster = self._build_cluster(cluster_cases, radius_km)
                clusters.append(cluster)

        clusters.sort(key=lambda c: c["case_count"], reverse=True)
        return clusters

    def _build_cluster(self, cases: List, radius_km: float) -> Dict:
        center_lat = sum(c.latitude for c in cases) / len(cases)
        center_lng = sum(c.longitude for c in cases) / len(cases)

        symptoms = defaultdict(int)
        villages = set()
        for c in cases:
            for s in c.symptoms:
                symptoms[s] += 1
            villages.add(c.village)

        top_symptoms = sorted(symptoms.items(), key=lambda x: x[1], reverse=True)[:5]

        now_str = cases[0].reported_at if cases else ""
        recent = sum(
            1 for c in cases
            if self._days_ago(c.reported_at) <= 7
        )
        older = sum(
            1 for c in cases
            if self._days_ago(c.reported_at) > 7
        )
        growth = ((recent - older) / older * 100) if older > 0 else 100.0

        severity_counts = defaultdict(int)
        for c in cases:
            severity_counts[c.severity] += 1

        critical_count = severity_counts.get("CRITICAL", 0) + severity_counts.get("HIGH", 0)

        risk_level = "LOW"
        if critical_count >= 5 or growth > 50:
            risk_level = "CRITICAL"
        elif critical_count >= 3 or growth > 30:
            risk_level = "HIGH"
        elif len(cases) >= 5:
            risk_level = "MEDIUM"

        cluster_id = f"CL-{hash((center_lat, center_lng)) % 10000:04d}"

        return {
            "cluster_id": cluster_id,
            "risk_level": risk_level,
            "center_lat": round(center_lat, 6),
            "center_lng": round(center_lng, 6),
            "radius_km": radius_km,
            "case_count": len(cases),
            "affected_villages": list(villages),
            "primary_symptoms": [s[0] for s in top_symptoms],
            "case_growth_percent": round(growth, 1),
            "severity_distribution": dict(severity_counts),
            "detected_at": now_str,
        }

    def _haversine(self, lat1, lon1, lat2, lon2) -> float:
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2
             + math.cos(math.radians(lat1))
             * math.cos(math.radians(lat2))
             * math.sin(dlon / 2) ** 2)
        return R * 2 * math.asin(math.sqrt(a))

    def _days_ago(self, date_str: str) -> int:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace("Z", ""))
            return (datetime.utcnow() - dt).days
        except Exception:
            return 0

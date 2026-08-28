"""
PashuRaksha Weather Service
Fetches real weather data from Open-Meteo API (free, no key required)
and correlates weather conditions with livestock disease risk.
"""

import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta

# District coordinates for Maharashtra
DISTRICT_COORDS = {
    "palghar": {"lat": 19.6967, "lng": 72.7699},
    "thane": {"lat": 19.2183, "lng": 72.9781},
    "nashik": {"lat": 19.9975, "lng": 73.7898},
    "pune": {"lat": 18.5204, "lng": 73.8567},
    "raigad": {"lat": 18.5158, "lng": 73.1822},
    "satara": {"lat": 17.6805, "lng": 74.0183},
    "kolhapur": {"lat": 16.7050, "lng": 74.2433},
    "nagpur": {"lat": 21.1458, "lng": 79.0882},
    "aurangabad": {"lat": 19.8762, "lng": 75.3433},
    "bhopal": {"lat": 23.2599, "lng": 77.4126},
    "vidisha": {"lat": 23.5244, "lng": 77.8145},
    "sehore": {"lat": 23.1979, "lng": 77.0851},
    # Default fallback
    "default": {"lat": 19.0760, "lng": 72.8777},
}

# Disease-weather correlation rules
WEATHER_DISEASE_RULES = {
    "Hemorrhagic Septicemia": {
        "trigger": "monsoon",
        "conditions": {"humidity_min": 75, "rainfall_min": 10},
        "description": "HS outbreaks correlate with onset of monsoon — high humidity and waterlogging create conditions for Pasteurella multiplication.",
        "risk_multiplier": 1.5,
    },
    "Foot and Mouth Disease": {
        "trigger": "hot_dry",
        "conditions": {"temp_max_min": 35, "humidity_max": 50},
        "description": "FMD spreads faster in hot, dry conditions when animals congregate at water sources. Virus survives longer in dry environments.",
        "risk_multiplier": 1.3,
    },
    "Lumpy Skin Disease": {
        "trigger": "rainy_vector",
        "conditions": {"rainfall_min": 5, "humidity_min": 60},
        "description": "LSD is vector-borne (mosquitoes, flies). Rainy season creates breeding grounds for vectors, increasing transmission risk.",
        "risk_multiplier": 1.4,
    },
    "Black Quarter": {
        "trigger": "post_rain",
        "conditions": {"rainfall_min": 15, "temp_max_min": 25},
        "description": "BQ spores activate in waterlogged soil after heavy rain. Young cattle grazing in recently flooded areas are most vulnerable.",
        "risk_multiplier": 1.6,
    },
    "Peste des Petits Ruminants": {
        "trigger": "cold_wet",
        "conditions": {"temp_max_max": 25, "humidity_min": 70},
        "description": "PPR severity increases in cold, wet conditions. Stressed animals in winter with poor shelter are highly susceptible.",
        "risk_multiplier": 1.3,
    },
    "Anthrax": {
        "trigger": "drought_break",
        "conditions": {"rainfall_min": 20, "temp_max_min": 30},
        "description": "Anthrax spores resurface after heavy rain following drought. Flooding exposes buried spores from old burial sites.",
        "risk_multiplier": 1.8,
    },
    "Mastitis": {
        "trigger": "humid",
        "conditions": {"humidity_min": 70},
        "description": "High humidity promotes bacterial growth in udder and milking environment, increasing mastitis incidence.",
        "risk_multiplier": 1.2,
    },
}


class WeatherService:
    OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

    def get_weather(self, district: str, days: int = 7) -> Dict:
        """Fetch current + forecast weather for a district."""
        coords = DISTRICT_COORDS.get(district.lower(), DISTRICT_COORDS["default"])

        try:
            params = {
                "latitude": coords["lat"],
                "longitude": coords["lng"],
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max",
                "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
                "timezone": "Asia/Kolkata",
                "forecast_days": days,
            }
            resp = requests.get(self.OPEN_METEO_BASE, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            return {
                "district": district,
                "coordinates": coords,
                "current": self._parse_current(data.get("current", {})),
                "daily_forecast": self._parse_daily(data.get("daily", {})),
                "fetched_at": datetime.now().isoformat(),
            }
        except Exception as e:
            # Fallback with mock data if API is unreachable
            return self._fallback_weather(district, coords, str(e))

    def get_disease_correlation(self, district: str) -> Dict:
        """Analyze weather conditions and correlate with disease risks."""
        weather = self.get_weather(district, days=7)
        current = weather.get("current", {})
        forecast = weather.get("daily_forecast", [])

        # Calculate averages from forecast
        avg_temp = 0.0
        avg_humidity = 0.0
        total_rainfall = 0.0

        if forecast:
            avg_temp = sum(d.get("temp_max", 30) for d in forecast) / len(forecast)
            avg_humidity = sum(d.get("humidity", 60) for d in forecast) / len(forecast)
            total_rainfall = sum(d.get("precipitation", 0) for d in forecast)

        # Evaluate disease risks based on weather
        disease_risks = []
        for disease, rule in WEATHER_DISEASE_RULES.items():
            conditions = rule["conditions"]
            risk_score = 0.0
            matched_conditions = []

            # Check each condition
            if "humidity_min" in conditions and avg_humidity >= conditions["humidity_min"]:
                risk_score += 0.3
                matched_conditions.append(f"Humidity {avg_humidity:.0f}% ≥ {conditions['humidity_min']}%")

            if "humidity_max" in conditions and avg_humidity <= conditions["humidity_max"]:
                risk_score += 0.3
                matched_conditions.append(f"Humidity {avg_humidity:.0f}% ≤ {conditions['humidity_max']}%")

            if "rainfall_min" in conditions and total_rainfall >= conditions["rainfall_min"]:
                risk_score += 0.3
                matched_conditions.append(f"Rainfall {total_rainfall:.1f}mm ≥ {conditions['rainfall_min']}mm")

            if "temp_max_min" in conditions and avg_temp >= conditions["temp_max_min"]:
                risk_score += 0.3
                matched_conditions.append(f"Temp {avg_temp:.1f}°C ≥ {conditions['temp_max_min']}°C")

            if "temp_max_max" in conditions and avg_temp <= conditions["temp_max_max"]:
                risk_score += 0.3
                matched_conditions.append(f"Temp {avg_temp:.1f}°C ≤ {conditions['temp_max_max']}°C")

            if matched_conditions:
                risk_level = "HIGH" if risk_score >= 0.6 else "MEDIUM" if risk_score >= 0.3 else "LOW"
                disease_risks.append({
                    "disease": disease,
                    "risk_level": risk_level,
                    "risk_score": round(min(risk_score, 1.0) * 100, 1),
                    "trigger_type": rule["trigger"],
                    "matched_conditions": matched_conditions,
                    "description": rule["description"],
                    "risk_multiplier": rule["risk_multiplier"],
                })

        # Sort by risk score
        disease_risks.sort(key=lambda x: x["risk_score"], reverse=True)

        # Determine overall season risk
        season = self._determine_season(avg_temp, avg_humidity, total_rainfall)

        return {
            "district": district,
            "weather_summary": {
                "avg_temperature": round(avg_temp, 1),
                "avg_humidity": round(avg_humidity, 1),
                "total_rainfall_7d": round(total_rainfall, 1),
                "current_temp": current.get("temperature", 0),
                "current_humidity": current.get("humidity", 0),
            },
            "season": season,
            "disease_risks": disease_risks,
            "advisory": self._generate_advisory(season, disease_risks),
            "fetched_at": datetime.now().isoformat(),
        }

    def _parse_current(self, data: Dict) -> Dict:
        return {
            "temperature": data.get("temperature_2m", 0),
            "humidity": data.get("relative_humidity_2m", 0),
            "precipitation": data.get("precipitation", 0),
            "weather_code": data.get("weather_code", 0),
            "wind_speed": data.get("wind_speed_10m", 0),
        }

    def _parse_daily(self, data: Dict) -> List[Dict]:
        days = []
        dates = data.get("time", [])
        for i, date in enumerate(dates):
            days.append({
                "date": date,
                "temp_max": data.get("temperature_2m_max", [0] * 7)[i] if i < len(data.get("temperature_2m_max", [])) else 0,
                "temp_min": data.get("temperature_2m_min", [0] * 7)[i] if i < len(data.get("temperature_2m_min", [])) else 0,
                "precipitation": data.get("precipitation_sum", [0] * 7)[i] if i < len(data.get("precipitation_sum", [])) else 0,
                "humidity": data.get("relative_humidity_2m_mean", [0] * 7)[i] if i < len(data.get("relative_humidity_2m_mean", [])) else 0,
                "wind_speed": data.get("wind_speed_10m_max", [0] * 7)[i] if i < len(data.get("wind_speed_10m_max", [])) else 0,
            })
        return days

    def _determine_season(self, temp: float, humidity: float, rainfall: float) -> Dict:
        if rainfall > 50 and humidity > 75:
            return {"name": "Monsoon", "code": "MONSOON", "risk": "HIGH", "advisory": "Peak disease season. HS, BQ, LSD risk elevated."}
        elif rainfall > 20 and humidity > 60:
            return {"name": "Pre/Post Monsoon", "code": "TRANSITION", "risk": "MEDIUM", "advisory": "Transitional period. Watch for vector-borne diseases."}
        elif temp > 35 and humidity < 50:
            return {"name": "Summer", "code": "SUMMER", "risk": "MEDIUM", "advisory": "Heat stress risk. FMD spreads at water sources."}
        elif temp < 20:
            return {"name": "Winter", "code": "WINTER", "risk": "LOW", "advisory": "Lower overall risk. PPR may increase in cold, wet conditions."}
        else:
            return {"name": "Moderate", "code": "MODERATE", "risk": "LOW", "advisory": "Standard surveillance recommended."}

    def _generate_advisory(self, season: Dict, risks: List[Dict]) -> str:
        if not risks:
            return f"Current season: {season['name']}. No elevated disease risks detected based on weather conditions."

        top_risks = [r["disease"] for r in risks[:3] if r["risk_level"] in ("HIGH", "MEDIUM")]
        if top_risks:
            return (
                f"Current season: {season['name']}. "
                f"Weather conditions indicate ELEVATED RISK for: {', '.join(top_risks)}. "
                f"Recommended: Increase surveillance, ensure vaccination coverage, "
                f"implement vector control measures."
            )
        return f"Current season: {season['name']}. Standard surveillance protocols sufficient."

    def _fallback_weather(self, district: str, coords: Dict, error: str) -> Dict:
        """Return plausible weather when API is unreachable (offline/demo mode)."""
        now = datetime.now()
        month = now.month

        # Simulate seasonal weather for Maharashtra
        if month in (6, 7, 8, 9):  # Monsoon
            temp, humidity, rain = 28.0, 85.0, 15.0
        elif month in (3, 4, 5):  # Summer
            temp, humidity, rain = 38.0, 40.0, 0.5
        elif month in (10, 11):  # Post-monsoon
            temp, humidity, rain = 30.0, 65.0, 3.0
        else:  # Winter
            temp, humidity, rain = 22.0, 55.0, 0.0

        return {
            "district": district,
            "coordinates": coords,
            "current": {"temperature": temp, "humidity": humidity, "precipitation": rain, "weather_code": 0, "wind_speed": 8.0},
            "daily_forecast": [
                {"date": (now + timedelta(days=i)).strftime("%Y-%m-%d"), "temp_max": temp + 2, "temp_min": temp - 5, "precipitation": rain, "humidity": humidity, "wind_speed": 10.0}
                for i in range(7)
            ],
            "fetched_at": now.isoformat(),
            "note": f"Offline fallback data (API error: {error[:50]})",
        }

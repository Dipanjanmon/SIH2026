package com.pashuraksha.api.weather;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherProxyService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeather(String district, int days) {
        String url = aiServiceUrl + "/api/v1/weather?district=" + district + "&days=" + days;
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of(
                "error", "Weather service unavailable",
                "district", district,
                "message", "Unable to fetch weather data: " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getDiseaseCorrelation(String district) {
        String url = aiServiceUrl + "/api/v1/weather/correlation?district=" + district;
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of(
                "error", "Correlation service unavailable",
                "district", district,
                "message", "Unable to fetch disease correlation: " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getDistricts() {
        String url = aiServiceUrl + "/api/v1/weather/districts";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of("error", "Service unavailable");
        }
    }
}

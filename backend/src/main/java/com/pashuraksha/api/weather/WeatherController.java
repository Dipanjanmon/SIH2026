package com.pashuraksha.api.weather;

import com.pashuraksha.api.ai.AiServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherProxyService weatherProxyService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(
            @RequestParam(defaultValue = "Palghar") String district,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(weatherProxyService.getWeather(district, days));
    }

    @GetMapping("/correlation")
    public ResponseEntity<Map<String, Object>> getDiseaseCorrelation(
            @RequestParam(defaultValue = "Palghar") String district) {
        return ResponseEntity.ok(weatherProxyService.getDiseaseCorrelation(district));
    }

    @GetMapping("/districts")
    public ResponseEntity<Map<String, Object>> getAvailableDistricts() {
        return ResponseEntity.ok(weatherProxyService.getDistricts());
    }
}

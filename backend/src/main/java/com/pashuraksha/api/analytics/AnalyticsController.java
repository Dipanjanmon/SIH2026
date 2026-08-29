package com.pashuraksha.api.analytics;

import com.pashuraksha.api.dto.DashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/by-disease")
    public ResponseEntity<Map<String, Long>> getCasesByDisease() {
        return ResponseEntity.ok(analyticsService.getCasesByDisease());
    }

    @GetMapping("/by-district")
    public ResponseEntity<Map<String, Long>> getCasesByDistrict() {
        return ResponseEntity.ok(analyticsService.getCasesByDistrict());
    }

    @GetMapping("/vaccination-coverage")
    public ResponseEntity<Map<String, Object>> getVaccinationCoverage() {
        return ResponseEntity.ok(analyticsService.getVaccinationCoverage());
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getCaseTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getCaseTrends(days));
    }

    @GetMapping("/disease-trends")
    public ResponseEntity<List<Map<String, Object>>> getDiseaseTrends() {
        return ResponseEntity.ok(analyticsService.getDiseaseTrends());
    }

    @GetMapping("/severity-distribution")
    public ResponseEntity<Map<String, Long>> getSeverityDistribution() {
        return ResponseEntity.ok(analyticsService.getSeverityDistribution());
    }
}

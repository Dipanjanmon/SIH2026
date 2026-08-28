package com.pashuraksha.api.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateRisk(@RequestBody Map<String, Double> request) {
        double latitude = request.get("latitude");
        double longitude = request.get("longitude");
        return ResponseEntity.ok(riskService.calculateRisk(latitude, longitude));
    }

    @GetMapping("/clusters")
    public ResponseEntity<List<Map<String, Object>>> detectClusters() {
        return ResponseEntity.ok(riskService.detectClusters());
    }
}

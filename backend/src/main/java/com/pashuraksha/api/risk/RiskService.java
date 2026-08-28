package com.pashuraksha.api.risk;

import com.pashuraksha.api.cases.DiseaseCase;
import com.pashuraksha.api.cases.DiseaseCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final DiseaseCaseRepository caseRepository;

    public Map<String, Object> calculateRisk(double latitude, double longitude) {
        List<DiseaseCase> nearbyCases = caseRepository.findCasesWithinRadius(latitude, longitude, 50000);

        double riskScore = 0.0;
        if (!nearbyCases.isEmpty()) {
            long criticalCount = nearbyCases.stream()
                    .filter(c -> c.getSeverity() == DiseaseCase.Severity.CRITICAL)
                    .count();
            long highCount = nearbyCases.stream()
                    .filter(c -> c.getSeverity() == DiseaseCase.Severity.HIGH)
                    .count();
            riskScore = Math.min(100.0, (criticalCount * 30) + (highCount * 20) + (nearbyCases.size() * 5));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("latitude", latitude);
        result.put("longitude", longitude);
        result.put("riskScore", riskScore);
        result.put("nearbyCases", nearbyCases.size());
        result.put("recommendation", riskScore > 60 ? "HIGH RISK - Immediate action needed" :
                riskScore > 30 ? "MODERATE RISK - Monitor closely" : "LOW RISK - Normal surveillance");
        return result;
    }

    public List<Map<String, Object>> detectClusters() {
        List<DiseaseCase> allCases = caseRepository.findAll();
        List<Map<String, Object>> clusters = new ArrayList<>();

        Map<String, List<DiseaseCase>> byDistrict = new HashMap<>();
        for (DiseaseCase c : allCases) {
            String district = c.getDistrict() != null ? c.getDistrict() : "Unknown";
            byDistrict.computeIfAbsent(district, k -> new ArrayList<>()).add(c);
        }

        for (Map.Entry<String, List<DiseaseCase>> entry : byDistrict.entrySet()) {
            if (entry.getValue().size() >= 3) {
                Map<String, Object> cluster = new HashMap<>();
                cluster.put("district", entry.getKey());
                cluster.put("caseCount", entry.getValue().size());
                cluster.put("severity", entry.getValue().stream()
                        .map(DiseaseCase::getSeverity)
                        .max(Comparator.comparing(Enum::ordinal))
                        .orElse(DiseaseCase.Severity.LOW));
                clusters.add(cluster);
            }
        }

        return clusters;
    }
}

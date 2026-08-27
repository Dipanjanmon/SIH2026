package com.pashuraksha.backend.service;

import com.pashuraksha.backend.dto.HealthReportRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.Data;
import java.util.List;

@Service
public class RiskEngineClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public RiskResponse calculateIndividualRisk(HealthReportRequest request) {
        RiskRequest payload = new RiskRequest();
        payload.setSymptom_severity(50);
        payload.setAffected_count(request.getAffectedCount() != null ? request.getAffectedCount() : 1);
        payload.setMortality(request.getMortality() != null && request.getMortality() > 0);
        payload.setVaccination_gap(false);

        String url = aiServiceUrl + "/risk/individual";
        try {
            return restTemplate.postForObject(url, payload, RiskResponse.class);
        } catch (Exception e) {
            System.err.println("Failed to reach Python Risk Engine: " + e.getMessage());
            RiskResponse fallback = new RiskResponse();
            fallback.setScore(0.0);
            fallback.setLevel("UNKNOWN");
            return fallback;
        }
    }

    public ClusterDetectResponse detectClusters(ClusterDetectRequest request) {
        String url = aiServiceUrl + "/clusters/detect";
        try {
            return restTemplate.postForObject(url, request, ClusterDetectResponse.class);
        } catch (Exception e) {
            System.err.println("Failed to reach Python Risk Engine for clusters: " + e.getMessage());
            ClusterDetectResponse fallback = new ClusterDetectResponse();
            fallback.setClusters(List.of());
            return fallback;
        }
    }

    @Data
    public static class RiskRequest {
        private int symptom_severity;
        private int affected_count;
        private boolean mortality;
        private boolean vaccination_gap;
    }

    @Data
    public static class RiskResponse {
        private Double score;
        private String level;
        private List<String> factors;
        private String algorithmVersion;
    }

    @Data
    public static class ClusterDetectRequest {
        private List<CasePoint> cases;
        private double radius_km = 5.0;
        private int minimum_cases = 3;
    }

    @Data
    public static class CasePoint {
        private String case_id;
        private double latitude;
        private double longitude;
    }

    @Data
    public static class ClusterDetectResponse {
        private List<ClusterInfo> clusters;
    }

    @Data
    public static class ClusterInfo {
        private String clusterId;
        private double centerLatitude;
        private double centerLongitude;
        private double radiusKm;
        private int caseCount;
        private List<String> memberCaseIds;
        private double riskScore;
        private String riskLevel;
    }
}

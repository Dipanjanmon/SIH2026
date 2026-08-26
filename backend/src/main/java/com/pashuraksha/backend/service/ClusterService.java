package com.pashuraksha.backend.service;

import com.pashuraksha.backend.entity.Cluster;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.repository.ClusterRepository;
import com.pashuraksha.backend.repository.DiseaseCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClusterService {
    
    private final DiseaseCaseRepository caseRepository;
    private final ClusterRepository clusterRepository;
    private final RiskEngineClient riskEngineClient;
    private final AlertService alertService;

    public void runClusterDetection() {
        List<DiseaseCase> activeCases = caseRepository.findAll(); 
        
        List<RiskEngineClient.CasePoint> casePoints = new ArrayList<>();
        for (DiseaseCase dc : activeCases) {
            if (dc.getFarm() != null && dc.getFarm().getLatitude() != null && dc.getFarm().getLongitude() != null) {
                RiskEngineClient.CasePoint cp = new RiskEngineClient.CasePoint();
                cp.setCase_id(dc.getCaseId().toString());
                cp.setLatitude(dc.getFarm().getLatitude());
                cp.setLongitude(dc.getFarm().getLongitude());
                casePoints.add(cp);
            }
        }
        
        RiskEngineClient.ClusterDetectRequest request = new RiskEngineClient.ClusterDetectRequest();
        request.setCases(casePoints);
        request.setRadius_km(5.0);
        request.setMinimum_cases(3);
        
        RiskEngineClient.ClusterDetectResponse response = riskEngineClient.detectClusters(request);
        
        if (response != null && response.getClusters() != null) {
            for (RiskEngineClient.ClusterInfo info : response.getClusters()) {
                Cluster cluster = Cluster.builder()
                        .customId(info.getClusterId())
                        .centerLatitude(info.getCenterLatitude())
                        .centerLongitude(info.getCenterLongitude())
                        .radiusKm(info.getRadiusKm())
                        .caseCount(info.getCaseCount())
                        .riskScore(info.getRiskScore())
                        .riskLevel(info.getRiskLevel())
                        .build();
                cluster = clusterRepository.save(cluster);
                
                // Phase 7: Trigger Alert
                alertService.createClusterAlert(cluster);
            }
        }
    }
}

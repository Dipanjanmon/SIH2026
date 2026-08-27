package com.pashuraksha.backend.service;

import com.pashuraksha.backend.entity.Alert;
import com.pashuraksha.backend.entity.Cluster;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public void createCaseAlert(DiseaseCase diseaseCase) {
        if ("CRITICAL".equals(diseaseCase.getRiskLevel()) || "HIGH".equals(diseaseCase.getRiskLevel())) {
            Alert alert = Alert.builder()
                .severity(diseaseCase.getRiskLevel())
                .message("High risk case detected at farm: " + (diseaseCase.getFarm() != null ? diseaseCase.getFarm().getFarmName() : "Unknown"))
                .targetRole("VETERINARIAN")
                .relatedCaseId(diseaseCase.getCaseId())
                .build();
            alertRepository.save(alert);
        }
    }

    public void createClusterAlert(Cluster cluster) {
        if ("CRITICAL".equals(cluster.getRiskLevel()) || "HIGH".equals(cluster.getRiskLevel())) {
            Alert alert = Alert.builder()
                .severity(cluster.getRiskLevel())
                .message("Cluster " + cluster.getCustomId() + " detected with " + cluster.getCaseCount() + " cases.")
                .targetRole("DISTRICT_OFFICER")
                .relatedClusterId(cluster.getClusterId())
                .build();
            alertRepository.save(alert);
            
            Alert blockAlert = Alert.builder()
                .severity(cluster.getRiskLevel())
                .message("Cluster " + cluster.getCustomId() + " requires immediate block-level action.")
                .targetRole("BLOCK_OFFICER")
                .relatedClusterId(cluster.getClusterId())
                .build();
            alertRepository.save(blockAlert);
            
            // Also notify Admin for State Dashboard
            Alert adminAlert = Alert.builder()
                .severity(cluster.getRiskLevel())
                .message("State Alert: Cluster " + cluster.getCustomId() + " has formed.")
                .targetRole("ADMIN")
                .relatedClusterId(cluster.getClusterId())
                .build();
            alertRepository.save(adminAlert);
        }
    }

    public List<Alert> getAlertsForRole(String role) {
        return alertRepository.findByTargetRoleOrderByCreatedAtDesc(role);
    }
}

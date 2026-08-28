package com.pashuraksha.api.cases;

import com.pashuraksha.api.ai.AiServiceClient;
import com.pashuraksha.api.alerts.Alert;
import com.pashuraksha.api.alerts.AlertRepository;
import com.pashuraksha.api.auth.User;
import com.pashuraksha.api.auth.UserRepository;
import com.pashuraksha.api.dto.CaseCreateRequest;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final DiseaseCaseRepository caseRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final AlertRepository alertRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    private static final AtomicLong caseCounter = new AtomicLong(1000);

    public DiseaseCase createCase(CaseCreateRequest request, String username) {
        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String caseNumber = "CASE-" + System.currentTimeMillis() + "-" + caseCounter.incrementAndGet();

        Point location = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        DiseaseCase diseaseCase = DiseaseCase.builder()
                .caseNumber(caseNumber)
                .reportedBy(reporter)
                .symptoms(request.getSymptoms() != null ? String.join(",", request.getSymptoms()) : "")
                .description(request.getDescription())
                .diseaseName(request.getDiseaseName())
                .severity(DiseaseCase.Severity.valueOf(request.getSeverity() != null ? request.getSeverity().toUpperCase() : "LOW"))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .location(location)
                .village(request.getVillage())
                .block(request.getBlock())
                .district(request.getDistrict())
                .build();

        diseaseCase = caseRepository.save(diseaseCase);

        // AI Risk Scoring — call Python AI service
        try {
            Map<String, String> chatPayload = Map.of(
                "message", String.join(" ", request.getSymptoms() != null ? request.getSymptoms() : List.of()),
                "animal_type", "cattle"
            );
            Map<String, Object> aiResult = aiServiceClient.chatAdvisory(chatPayload);

            if (aiResult != null && aiResult.get("risk_level") != null) {
                String riskLevel = aiResult.get("risk_level").toString();
                Object confidence = aiResult.get("confidence");
                double riskScore = confidence != null ? ((Number) confidence).doubleValue() * 100.0 : 0.0;

                diseaseCase.setRiskScore(riskScore);
                diseaseCase.setRiskLevel(riskLevel);

                // Use AI's disease prediction if farmer didn't specify
                if (diseaseCase.getDiseaseName() == null && aiResult.get("probable_disease") != null) {
                    diseaseCase.setDiseaseName(aiResult.get("probable_disease").toString());
                }

                // Upgrade severity if AI says it's worse
                if ("CRITICAL".equals(riskLevel) && diseaseCase.getSeverity().ordinal() < DiseaseCase.Severity.CRITICAL.ordinal()) {
                    diseaseCase.setSeverity(DiseaseCase.Severity.CRITICAL);
                } else if ("HIGH".equals(riskLevel) && diseaseCase.getSeverity().ordinal() < DiseaseCase.Severity.HIGH.ordinal()) {
                    diseaseCase.setSeverity(DiseaseCase.Severity.HIGH);
                }

                diseaseCase = caseRepository.save(diseaseCase);

                // Auto-generate alert for HIGH/CRITICAL cases
                if ("CRITICAL".equals(riskLevel) || "HIGH".equals(riskLevel)) {
                    generateAlert(diseaseCase, riskLevel);
                }
            }
        } catch (Exception e) {
            // ponytail: AI scoring is best-effort — case still saved if AI is down
            System.err.println("[CaseService] AI risk scoring failed: " + e.getMessage());
        }

        return diseaseCase;
    }

    private void generateAlert(DiseaseCase dc, String riskLevel) {
        String disease = dc.getDiseaseName() != null ? dc.getDiseaseName() : "Unknown disease";
        String location = (dc.getVillage() != null ? dc.getVillage() : "") +
                (dc.getDistrict() != null ? ", " + dc.getDistrict() : "");

        Alert.AlertSeverity severity = "CRITICAL".equals(riskLevel)
                ? Alert.AlertSeverity.CRITICAL : Alert.AlertSeverity.HIGH;

        // Alert for veterinarians
        alertRepository.save(Alert.builder()
                .title(riskLevel + " Risk: " + disease + " — " + location)
                .message("Case " + dc.getCaseNumber() + " reported with " + riskLevel +
                        " risk level. Symptoms: " + dc.getSymptoms() +
                        ". Immediate veterinary attention required.")
                .severity(severity)
                .type(Alert.AlertType.RISK)
                .targetRole("VETERINARIAN")
                .district(dc.getDistrict())
                .latitude(dc.getLatitude())
                .longitude(dc.getLongitude())
                .build());

        // Critical cases also alert government
        if ("CRITICAL".equals(riskLevel)) {
            alertRepository.save(Alert.builder()
                    .title("CRITICAL Outbreak Risk: " + disease + " — " + location)
                    .message("Critical risk case " + dc.getCaseNumber() + " detected. " +
                            "Potential outbreak in " + dc.getDistrict() + " district. " +
                            "Containment measures may be required.")
                    .severity(Alert.AlertSeverity.CRITICAL)
                    .type(Alert.AlertType.OUTBREAK)
                    .targetRole("GOVT_OFFICIAL")
                    .district(dc.getDistrict())
                    .latitude(dc.getLatitude())
                    .longitude(dc.getLongitude())
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<DiseaseCase> getAllCases() {
        return caseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DiseaseCase getCaseById(Long id) {
        return caseRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));
    }

    public DiseaseCase updateCase(Long id, DiseaseCase updatedCase) {
        DiseaseCase existing = getCaseById(id);
        existing.setSeverity(updatedCase.getSeverity());
        existing.setStatus(updatedCase.getStatus());
        existing.setDescription(updatedCase.getDescription());
        existing.setRiskScore(updatedCase.getRiskScore());
        return caseRepository.save(existing);
    }

    public DiseaseCase assignVeterinarian(Long caseId, Long vetId) {
        DiseaseCase diseaseCase = getCaseById(caseId);
        User vet = userRepository.findById(vetId).orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        diseaseCase.setVeterinarian(vet);
        diseaseCase.setStatus(DiseaseCase.CaseStatus.ASSIGNED);
        return caseRepository.save(diseaseCase);
    }

    public DiseaseCase updateStatus(Long caseId, DiseaseCase.CaseStatus status) {
        DiseaseCase diseaseCase = getCaseById(caseId);
        diseaseCase.setStatus(status);
        return caseRepository.save(diseaseCase);
    }

    public List<DiseaseCase> findNearbyCases(double latitude, double longitude, double radiusMeters) {
        return caseRepository.findCasesWithinRadius(latitude, longitude, radiusMeters);
    }

    public List<DiseaseCase> findByStatus(DiseaseCase.CaseStatus status) {
        return caseRepository.findByStatus(status);
    }

    public List<DiseaseCase> findByDistrict(String district) {
        return caseRepository.findByDistrict(district);
    }
}

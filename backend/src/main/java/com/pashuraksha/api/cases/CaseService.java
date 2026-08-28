package com.pashuraksha.api.cases;

import com.pashuraksha.api.auth.User;
import com.pashuraksha.api.auth.UserRepository;
import com.pashuraksha.api.dto.CaseCreateRequest;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final DiseaseCaseRepository caseRepository;
    private final UserRepository userRepository;
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
                .symptoms(request.getSymptoms() != null ? request.getSymptoms().toArray(new String[0]) : new String[0])
                .description(request.getDescription())
                .severity(DiseaseCase.Severity.valueOf(request.getSeverity() != null ? request.getSeverity().toUpperCase() : "LOW"))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .location(location)
                .village(request.getVillage())
                .block(request.getBlock())
                .district(request.getDistrict())
                .build();

        return caseRepository.save(diseaseCase);
    }

    public List<DiseaseCase> getAllCases() {
        return caseRepository.findAll();
    }

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

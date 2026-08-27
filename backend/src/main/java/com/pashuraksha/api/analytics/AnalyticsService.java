package com.pashuraksha.api.analytics;

import com.pashuraksha.api.alerts.AlertRepository;
import com.pashuraksha.api.animals.AnimalRepository;
import com.pashuraksha.api.cases.DiseaseCase;
import com.pashuraksha.api.cases.DiseaseCaseRepository;
import com.pashuraksha.api.dto.DashboardStats;
import com.pashuraksha.api.farms.FarmRepository;
import com.pashuraksha.api.vaccinations.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DiseaseCaseRepository caseRepository;
    private final AnimalRepository animalRepository;
    private final FarmRepository farmRepository;
    private final VaccinationRepository vaccinationRepository;
    private final AlertRepository alertRepository;

    public DashboardStats getDashboardStats() {
        long totalCases = caseRepository.count();
        long activeCases = caseRepository.findByStatus(DiseaseCase.CaseStatus.REPORTED).size()
                + caseRepository.findByStatus(DiseaseCase.CaseStatus.ASSIGNED).size()
                + caseRepository.findByStatus(DiseaseCase.CaseStatus.IN_PROGRESS).size();
        long highRiskCases = caseRepository.findBySeverity(DiseaseCase.Severity.HIGH).size()
                + caseRepository.findBySeverity(DiseaseCase.Severity.CRITICAL).size();

        return DashboardStats.builder()
                .totalCases(totalCases)
                .activeCases(activeCases)
                .highRiskCases(highRiskCases)
                .totalAnimals(animalRepository.count())
                .totalFarms(farmRepository.count())
                .vaccinatedAnimals(0L)
                .recentAlerts((long) alertRepository.findByIsReadFalse().size())
                .build();
    }

    public Map<String, Long> getCasesByDisease() {
        List<Object[]> results = caseRepository.countCasesBySeverity();
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : results) {
            map.put(row[0].toString(), (Long) row[1]);
        }
        return map;
    }

    public Map<String, Long> getCasesByDistrict() {
        List<Object[]> results = caseRepository.countCasesByDistrict();
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : results) {
            String district = row[0] != null ? row[0].toString() : "Unknown";
            map.put(district, (Long) row[1]);
        }
        return map;
    }

    public Map<String, Object> getVaccinationCoverage() {
        Map<String, Object> coverage = new HashMap<>();
        coverage.put("totalAnimals", animalRepository.count());
        coverage.put("totalVaccinations", vaccinationRepository.count());
        return coverage;
    }
}

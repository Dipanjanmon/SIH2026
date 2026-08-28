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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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
                .vaccinatedAnimals(vaccinationRepository.count())
                .recentAlerts((long) alertRepository.findByIsReadFalse().size())
                .build();
    }

    public Map<String, Long> getCasesByDisease() {
        List<DiseaseCase> cases = caseRepository.findAll();
        return cases.stream()
                .filter(c -> c.getDiseaseName() != null)
                .collect(Collectors.groupingBy(DiseaseCase::getDiseaseName, Collectors.counting()));
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
        long totalAnimals = animalRepository.count();
        long totalVaccinations = vaccinationRepository.count();
        double coveragePercent = totalAnimals > 0 ? (double) totalVaccinations / totalAnimals * 100.0 : 0.0;

        coverage.put("totalAnimals", totalAnimals);
        coverage.put("totalVaccinations", totalVaccinations);
        coverage.put("coveragePercent", Math.round(coveragePercent * 10.0) / 10.0);
        return coverage;
    }

    public Map<String, Object> getCaseTrends(int days) {
        List<DiseaseCase> allCases = caseRepository.findAll();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Group cases by day
        Map<String, Long> dailyCounts = new TreeMap<>();
        Map<String, Long> cumulativeCounts = new TreeMap<>();

        // Initialize all days in range
        for (int i = days; i >= 0; i--) {
            String dateStr = LocalDateTime.now().minusDays(i).format(fmt);
            dailyCounts.put(dateStr, 0L);
        }

        // Count cases per day
        long cumulative = 0;
        for (DiseaseCase c : allCases) {
            if (c.getReportedAt() != null && c.getReportedAt().isAfter(cutoff)) {
                String dateStr = c.getReportedAt().format(fmt);
                dailyCounts.merge(dateStr, 1L, Long::sum);
            }
        }

        // Build cumulative
        for (Map.Entry<String, Long> entry : dailyCounts.entrySet()) {
            cumulative += entry.getValue();
            cumulativeCounts.put(entry.getKey(), cumulative);
        }

        // Weekly summary
        long thisWeek = allCases.stream()
                .filter(c -> c.getReportedAt() != null && c.getReportedAt().isAfter(LocalDateTime.now().minusDays(7)))
                .count();
        long lastWeek = allCases.stream()
                .filter(c -> c.getReportedAt() != null
                        && c.getReportedAt().isAfter(LocalDateTime.now().minusDays(14))
                        && c.getReportedAt().isBefore(LocalDateTime.now().minusDays(7)))
                .count();
        double weeklyChange = lastWeek > 0 ? ((double)(thisWeek - lastWeek) / lastWeek) * 100.0 : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("daily", dailyCounts.entrySet().stream()
                .map(e -> Map.of("date", e.getKey(), "cases", e.getValue()))
                .collect(Collectors.toList()));
        result.put("cumulative", cumulativeCounts.entrySet().stream()
                .map(e -> Map.of("date", e.getKey(), "total", e.getValue()))
                .collect(Collectors.toList()));
        result.put("thisWeek", thisWeek);
        result.put("lastWeek", lastWeek);
        result.put("weeklyChangePercent", Math.round(weeklyChange * 10.0) / 10.0);
        result.put("totalInPeriod", allCases.stream()
                .filter(c -> c.getReportedAt() != null && c.getReportedAt().isAfter(cutoff))
                .count());
        return result;
    }

    public List<Map<String, Object>> getDiseaseTrends() {
        List<DiseaseCase> allCases = caseRepository.findAll();

        // Group by disease → count + severity breakdown
        Map<String, List<DiseaseCase>> byDisease = allCases.stream()
                .filter(c -> c.getDiseaseName() != null)
                .collect(Collectors.groupingBy(DiseaseCase::getDiseaseName));

        List<Map<String, Object>> trends = new ArrayList<>();
        for (Map.Entry<String, List<DiseaseCase>> entry : byDisease.entrySet()) {
            List<DiseaseCase> cases = entry.getValue();
            long critical = cases.stream().filter(c -> c.getSeverity() == DiseaseCase.Severity.CRITICAL).count();
            long high = cases.stream().filter(c -> c.getSeverity() == DiseaseCase.Severity.HIGH).count();
            long active = cases.stream().filter(c ->
                    c.getStatus() != DiseaseCase.CaseStatus.RECOVERED && c.getStatus() != DiseaseCase.CaseStatus.DECEASED
            ).count();

            Map<String, Object> trend = new HashMap<>();
            trend.put("disease", entry.getKey());
            trend.put("totalCases", cases.size());
            trend.put("activeCases", active);
            trend.put("criticalCount", critical);
            trend.put("highCount", high);
            trend.put("districts", cases.stream()
                    .map(DiseaseCase::getDistrict)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList()));
            trends.add(trend);
        }

        trends.sort((a, b) -> Integer.compare((int) b.get("totalCases"), (int) a.get("totalCases")));
        return trends;
    }

    public Map<String, Long> getSeverityDistribution() {
        List<DiseaseCase> allCases = caseRepository.findAll();
        return allCases.stream()
                .collect(Collectors.groupingBy(c -> c.getSeverity().name(), Collectors.counting()));
    }
}

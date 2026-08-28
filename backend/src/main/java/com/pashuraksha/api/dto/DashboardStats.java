package com.pashuraksha.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {

    private Long totalCases;
    private Long activeCases;
    private Long highRiskCases;
    private Long totalAnimals;
    private Long totalFarms;
    private Long vaccinatedAnimals;
    private Long recentAlerts;
}

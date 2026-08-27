package com.pashuraksha.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class HealthReportRequest {
    private UUID farmId;
    private UUID animalId;
    private Integer affectedCount;
    private Integer mortality;
    private Integer symptomDurationDays;
    private String observedNotes;
    private List<String> symptoms;
}

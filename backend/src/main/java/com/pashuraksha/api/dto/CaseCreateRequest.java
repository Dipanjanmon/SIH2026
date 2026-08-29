package com.pashuraksha.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseCreateRequest {

    private Long animalId;  // optional — farmer may not know tag number

    private List<String> symptoms;

    private String description;

    private String severity;

    private String diseaseName;

    private Double latitude;
    private Double longitude;

    private String village;
    private String block;
    private String district;
}

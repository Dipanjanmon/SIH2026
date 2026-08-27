package com.pashuraksha.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseCreateRequest {

    @NotNull
    private Long animalId;

    private List<String> symptoms;

    private String description;

    private String severity;

    private Double latitude;
    private Double longitude;

    private String village;
    private String block;
    private String district;
}

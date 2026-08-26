package com.pashuraksha.backend.controller;

import com.pashuraksha.backend.dto.HealthReportRequest;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.service.DiseaseCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class DiseaseCaseController {

    private final DiseaseCaseService caseService;

    @PostMapping
    public ResponseEntity<DiseaseCase> createCase(@RequestBody HealthReportRequest request) {
        return ResponseEntity.ok(caseService.submitHealthReport(request));
    }

    @GetMapping
    public ResponseEntity<List<DiseaseCase>> getAllCases() {
        return ResponseEntity.ok(caseService.getAllCases());
    }
}

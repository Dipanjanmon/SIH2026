package com.pashuraksha.api.cases;

import com.pashuraksha.api.dto.CaseCreateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<DiseaseCase> createCase(@Valid @RequestBody CaseCreateRequest request,
                                                  Authentication authentication) {
        return ResponseEntity.ok(caseService.createCase(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<DiseaseCase>> getAllCases() {
        return ResponseEntity.ok(caseService.getAllCases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiseaseCase> getCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiseaseCase> updateCase(@PathVariable Long id, @RequestBody DiseaseCase diseaseCase) {
        return ResponseEntity.ok(caseService.updateCase(id, diseaseCase));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<DiseaseCase>> findNearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "50000") double radius) {
        return ResponseEntity.ok(caseService.findNearbyCases(latitude, longitude, radius));
    }

    @PostMapping("/{caseId}/assign/{vetId}")
    public ResponseEntity<DiseaseCase> assignVeterinarian(@PathVariable Long caseId, @PathVariable Long vetId) {
        return ResponseEntity.ok(caseService.assignVeterinarian(caseId, vetId));
    }

    @PutMapping("/{caseId}/status")
    public ResponseEntity<DiseaseCase> updateStatus(@PathVariable Long caseId,
                                                    @RequestBody Map<String, String> body) {
        DiseaseCase.CaseStatus status = DiseaseCase.CaseStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(caseService.updateStatus(caseId, status));
    }
}

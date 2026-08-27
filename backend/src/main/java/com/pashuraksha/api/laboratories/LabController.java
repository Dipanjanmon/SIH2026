package com.pashuraksha.api.laboratories;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lab-samples")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @PostMapping
    public ResponseEntity<LabSample> createSample(@RequestBody LabSample sample) {
        return ResponseEntity.ok(labService.createSample(sample));
    }

    @GetMapping
    public ResponseEntity<List<LabSample>> getAllSamples() {
        return ResponseEntity.ok(labService.getAllSamples());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabSample> getSampleById(@PathVariable Long id) {
        return ResponseEntity.ok(labService.getSampleById(id));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<LabSample> updateResult(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LabSample.TestResult result = LabSample.TestResult.valueOf(body.get("result"));
        return ResponseEntity.ok(labService.updateResult(id, result, body.get("diseaseDetected"), body.get("labNotes")));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LabSample> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LabSample.SampleStatus status = LabSample.SampleStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(labService.updateStatus(id, status));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LabSample>> getPendingSamples() {
        return ResponseEntity.ok(labService.findPendingSamples());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<LabSample>> findByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(labService.findByCase(caseId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSample(@PathVariable Long id) {
        labService.deleteSample(id);
        return ResponseEntity.noContent().build();
    }
}

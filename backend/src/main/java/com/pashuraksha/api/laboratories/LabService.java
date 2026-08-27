package com.pashuraksha.api.laboratories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabService {

    private final LabSampleRepository labSampleRepository;

    public LabSample createSample(LabSample sample) {
        return labSampleRepository.save(sample);
    }

    public List<LabSample> getAllSamples() {
        return labSampleRepository.findAll();
    }

    public LabSample getSampleById(Long id) {
        return labSampleRepository.findById(id).orElseThrow(() -> new RuntimeException("Lab sample not found"));
    }

    public LabSample updateResult(Long id, LabSample.TestResult result, String diseaseDetected, String labNotes) {
        LabSample sample = getSampleById(id);
        sample.setResult(result);
        sample.setDiseaseDetected(diseaseDetected);
        sample.setLabNotes(labNotes);
        sample.setStatus(LabSample.SampleStatus.COMPLETED);
        sample.setTestedAt(LocalDateTime.now());
        return labSampleRepository.save(sample);
    }

    public LabSample updateStatus(Long id, LabSample.SampleStatus status) {
        LabSample sample = getSampleById(id);
        sample.setStatus(status);
        return labSampleRepository.save(sample);
    }

    public List<LabSample> findPendingSamples() {
        return labSampleRepository.findByStatus(LabSample.SampleStatus.COLLECTED);
    }

    public List<LabSample> findByCase(Long caseId) {
        return labSampleRepository.findByCaseId_Id(caseId);
    }

    public void deleteSample(Long id) {
        labSampleRepository.deleteById(id);
    }
}

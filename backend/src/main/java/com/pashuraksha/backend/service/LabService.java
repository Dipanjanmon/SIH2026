package com.pashuraksha.backend.service;

import com.pashuraksha.backend.entity.CaseStatus;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.entity.LabSample;
import com.pashuraksha.backend.repository.DiseaseCaseRepository;
import com.pashuraksha.backend.repository.LabSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabService {

    private final LabSampleRepository labSampleRepository;
    private final DiseaseCaseRepository caseRepository;

    public LabSample submitTestResult(UUID sampleId, String result, String pathogen) {
        LabSample sample = labSampleRepository.findById(sampleId)
            .orElseThrow(() -> new RuntimeException("Sample not found"));
            
        sample.setTestResult(result);
        sample.setPathogenIdentified(pathogen);
        sample.setStatus("COMPLETED");
        sample.setResultAvailableAt(LocalDateTime.now());
        
        sample = labSampleRepository.save(sample);
        
        DiseaseCase diseaseCase = sample.getDiseaseCase();
        diseaseCase.setStatus(CaseStatus.RESULT_AVAILABLE);
        caseRepository.save(diseaseCase);
        
        return sample;
    }
}

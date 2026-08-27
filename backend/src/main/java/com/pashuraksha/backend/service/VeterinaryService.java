package com.pashuraksha.backend.service;

import com.pashuraksha.backend.entity.CaseStatus;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.entity.LabSample;
import com.pashuraksha.backend.repository.DiseaseCaseRepository;
import com.pashuraksha.backend.repository.LabSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VeterinaryService {
    
    private final DiseaseCaseRepository caseRepository;
    private final LabSampleRepository labSampleRepository;

    public DiseaseCase updateCaseStatus(UUID caseId, CaseStatus newStatus) {
        DiseaseCase diseaseCase = caseRepository.findById(caseId)
            .orElseThrow(() -> new RuntimeException("Case not found"));
        diseaseCase.setStatus(newStatus);
        return caseRepository.save(diseaseCase);
    }
    
    public LabSample requestLabTest(UUID caseId, String sampleType, String assignedLab) {
        DiseaseCase diseaseCase = caseRepository.findById(caseId)
            .orElseThrow(() -> new RuntimeException("Case not found"));
            
        diseaseCase.setStatus(CaseStatus.SAMPLE_COLLECTED);
        caseRepository.save(diseaseCase);
            
        LabSample sample = LabSample.builder()
            .diseaseCase(diseaseCase)
            .sampleType(sampleType)
            .assignedLab(assignedLab)
            .build();
            
        return labSampleRepository.save(sample);
    }
}

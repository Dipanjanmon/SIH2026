package com.pashuraksha.backend.service;

import com.pashuraksha.backend.dto.HealthReportRequest;
import com.pashuraksha.backend.entity.DiseaseCase;
import com.pashuraksha.backend.entity.Farm;
import com.pashuraksha.backend.entity.Symptom;
import com.pashuraksha.backend.repository.DiseaseCaseRepository;
import com.pashuraksha.backend.repository.FarmRepository;
import com.pashuraksha.backend.repository.SymptomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiseaseCaseService {
    
    private final DiseaseCaseRepository caseRepository;
    private final FarmRepository farmRepository;
    private final SymptomRepository symptomRepository;
    private final RiskEngineClient riskEngineClient;
    private final AlertService alertService;

    @Transactional
    public DiseaseCase submitHealthReport(HealthReportRequest request) {
        Farm farm = null;
        if (request.getFarmId() != null) {
            farm = farmRepository.findById(request.getFarmId()).orElse(null);
        }
            
        List<Symptom> symptomsList = new ArrayList<>();
        if (request.getSymptoms() != null) {
            for (String sName : request.getSymptoms()) {
                Symptom s = symptomRepository.findByName(sName.toUpperCase());
                if (s == null) {
                    s = Symptom.builder().name(sName.toUpperCase()).build();
                    s = symptomRepository.save(s);
                }
                symptomsList.add(s);
            }
        }
        
        DiseaseCase newCase = DiseaseCase.builder()
            .farm(farm)
            .affectedCount(request.getAffectedCount())
            .mortality(request.getMortality())
            .symptomDurationDays(request.getSymptomDurationDays())
            .observedNotes(request.getObservedNotes())
            .symptoms(symptomsList)
            .build();
            
        // Phase 5: Risk calculation via Python engine
        RiskEngineClient.RiskResponse risk = riskEngineClient.calculateIndividualRisk(request);
        newCase.setRiskScore(risk.getScore());
        newCase.setRiskLevel(risk.getLevel());
            
        newCase = caseRepository.save(newCase);
        
        // Phase 7: Trigger Alert
        alertService.createCaseAlert(newCase);
        
        return newCase;
    }
    
    public List<DiseaseCase> getAllCases() {
        return caseRepository.findAll();
    }
}

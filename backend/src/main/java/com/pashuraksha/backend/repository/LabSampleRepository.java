package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.LabSample;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LabSampleRepository extends JpaRepository<LabSample, UUID> {
    List<LabSample> findByDiseaseCase_CaseId(UUID caseId);
}

package com.pashuraksha.api.laboratories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabSampleRepository extends JpaRepository<LabSample, Long> {

    List<LabSample> findByStatus(LabSample.SampleStatus status);

    List<LabSample> findByCaseId_Id(Long caseId);

    List<LabSample> findByResult(LabSample.TestResult result);
}

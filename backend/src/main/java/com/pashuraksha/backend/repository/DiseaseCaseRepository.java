package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.DiseaseCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DiseaseCaseRepository extends JpaRepository<DiseaseCase, UUID> {
    List<DiseaseCase> findByFarm_FarmId(UUID farmId);
}

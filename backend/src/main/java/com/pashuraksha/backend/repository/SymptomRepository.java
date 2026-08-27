package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SymptomRepository extends JpaRepository<Symptom, UUID> {
    Symptom findByName(String name);
}

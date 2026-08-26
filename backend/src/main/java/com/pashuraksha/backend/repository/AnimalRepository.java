package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {
    List<Animal> findByFarm_FarmId(UUID farmId);
}

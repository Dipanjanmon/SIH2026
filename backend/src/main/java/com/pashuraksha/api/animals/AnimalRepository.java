package com.pashuraksha.api.animals;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByFarmId_Id(Long farmId);

    Optional<Animal> findByTagNumber(String tagNumber);

    List<Animal> findByStatus(Animal.AnimalStatus status);
}

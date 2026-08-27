package com.pashuraksha.api.vaccinations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {

    List<Vaccination> findByAnimalId_Id(Long animalId);

    List<Vaccination> findByVaccineName(String vaccineName);

    long countByAnimalId_Id(Long animalId);
}

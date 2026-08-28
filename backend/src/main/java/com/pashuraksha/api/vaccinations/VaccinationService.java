package com.pashuraksha.api.vaccinations;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VaccinationService {

    private final VaccinationRepository vaccinationRepository;

    public Vaccination createVaccination(Vaccination vaccination) {
        return vaccinationRepository.save(vaccination);
    }

    public List<Vaccination> getAllVaccinations() {
        return vaccinationRepository.findAll();
    }

    public Vaccination getVaccinationById(Long id) {
        return vaccinationRepository.findById(id).orElseThrow(() -> new RuntimeException("Vaccination not found"));
    }

    public Vaccination updateVaccination(Long id, Vaccination updatedVaccination) {
        Vaccination existing = getVaccinationById(id);
        existing.setVaccineName(updatedVaccination.getVaccineName());
        existing.setBatchNumber(updatedVaccination.getBatchNumber());
        existing.setDoseNumber(updatedVaccination.getDoseNumber());
        existing.setNextDoseDate(updatedVaccination.getNextDoseDate());
        existing.setNotes(updatedVaccination.getNotes());
        return vaccinationRepository.save(existing);
    }

    public void deleteVaccination(Long id) {
        vaccinationRepository.deleteById(id);
    }

    public List<Vaccination> findByAnimal(Long animalId) {
        return vaccinationRepository.findByAnimalId_Id(animalId);
    }
}

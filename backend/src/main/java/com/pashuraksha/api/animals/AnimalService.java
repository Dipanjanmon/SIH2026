package com.pashuraksha.api.animals;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimalService {

    private final AnimalRepository animalRepository;

    public Animal createAnimal(Animal animal) {
        return animalRepository.save(animal);
    }

    public List<Animal> getAllAnimals() {
        return animalRepository.findAll();
    }

    public Animal getAnimalById(Long id) {
        return animalRepository.findById(id).orElseThrow(() -> new RuntimeException("Animal not found"));
    }

    public Animal updateAnimal(Long id, Animal updatedAnimal) {
        Animal existing = getAnimalById(id);
        existing.setName(updatedAnimal.getName());
        existing.setSpecies(updatedAnimal.getSpecies());
        existing.setBreed(updatedAnimal.getBreed());
        existing.setGender(updatedAnimal.getGender());
        existing.setAgeMonths(updatedAnimal.getAgeMonths());
        existing.setStatus(updatedAnimal.getStatus());
        existing.setPhotoUrl(updatedAnimal.getPhotoUrl());
        return animalRepository.save(existing);
    }

    public void deleteAnimal(Long id) {
        animalRepository.deleteById(id);
    }

    public List<Animal> findByFarm(Long farmId) {
        return animalRepository.findByFarmId_Id(farmId);
    }

    public Animal findByTagNumber(String tagNumber) {
        return animalRepository.findByTagNumber(tagNumber)
                .orElseThrow(() -> new RuntimeException("Animal with tag not found"));
    }
}

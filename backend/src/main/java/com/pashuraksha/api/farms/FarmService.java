package com.pashuraksha.api.farms;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;

    public Farm createFarm(Farm farm) {
        return farmRepository.save(farm);
    }

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public Farm getFarmById(Long id) {
        return farmRepository.findById(id).orElseThrow(() -> new RuntimeException("Farm not found"));
    }

    public Farm updateFarm(Long id, Farm updatedFarm) {
        Farm existing = getFarmById(id);
        existing.setName(updatedFarm.getName());
        existing.setVillage(updatedFarm.getVillage());
        existing.setBlock(updatedFarm.getBlock());
        existing.setDistrict(updatedFarm.getDistrict());
        existing.setState(updatedFarm.getState());
        existing.setAreaAcres(updatedFarm.getAreaAcres());
        existing.setLatitude(updatedFarm.getLatitude());
        existing.setLongitude(updatedFarm.getLongitude());
        existing.setTotalAnimals(updatedFarm.getTotalAnimals());
        return farmRepository.save(existing);
    }

    public void deleteFarm(Long id) {
        farmRepository.deleteById(id);
    }

    public List<Farm> findByFarmer(Long farmerId) {
        return farmRepository.findByFarmerId_Id(farmerId);
    }
}

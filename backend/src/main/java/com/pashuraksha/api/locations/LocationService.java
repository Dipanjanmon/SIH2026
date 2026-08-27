package com.pashuraksha.api.locations;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
    }

    public Location updateLocation(Long id, Location updatedLocation) {
        Location existing = getLocationById(id);
        existing.setName(updatedLocation.getName());
        existing.setType(updatedLocation.getType());
        existing.setParentCode(updatedLocation.getParentCode());
        existing.setLatitude(updatedLocation.getLatitude());
        existing.setLongitude(updatedLocation.getLongitude());
        return locationRepository.save(existing);
    }

    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }

    public List<Location> findByType(Location.LocationType type) {
        return locationRepository.findByType(type);
    }

    public List<Location> findByParentCode(String parentCode) {
        return locationRepository.findByParentCode(parentCode);
    }

    public Location findByCode(String code) {
        return locationRepository.findByCode(code);
    }
}

package com.pashuraksha.api.locations;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationService.createLocation(location));
    }

    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @RequestBody Location location) {
        return ResponseEntity.ok(locationService.updateLocation(id, location));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Location>> findByType(@PathVariable String type) {
        return ResponseEntity.ok(locationService.findByType(Location.LocationType.valueOf(type.toUpperCase())));
    }

    @GetMapping("/parent/{parentCode}")
    public ResponseEntity<List<Location>> findByParentCode(@PathVariable String parentCode) {
        return ResponseEntity.ok(locationService.findByParentCode(parentCode));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Location> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(locationService.findByCode(code));
    }
}

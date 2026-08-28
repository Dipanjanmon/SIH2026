package com.pashuraksha.api.locations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByType(Location.LocationType type);

    List<Location> findByParentCode(String parentCode);

    Location findByCode(String code);
}

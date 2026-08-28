package com.pashuraksha.api.farms;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByFarmerId_Id(Long farmerId);

    List<Farm> findByDistrict(String district);
}

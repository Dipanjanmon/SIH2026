package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FarmRepository extends JpaRepository<Farm, UUID> {
    List<Farm> findByFarmer_FarmerId(UUID farmerId);
}

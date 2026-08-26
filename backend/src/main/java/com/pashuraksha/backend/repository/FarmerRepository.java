package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface FarmerRepository extends JpaRepository<Farmer, UUID> {
}

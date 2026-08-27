package com.pashuraksha.api.farmers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByUserId_Id(Long userId);

    Optional<Farmer> findByAadharNumber(String aadharNumber);
}

package com.pashuraksha.api.alerts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByIsReadFalse();

    List<Alert> findByTargetRole(String targetRole);

    List<Alert> findByDistrict(String district);
}

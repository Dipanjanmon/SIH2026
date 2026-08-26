package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<Alert> findByIsReadFalseAndTargetRoleOrderByCreatedAtDesc(String targetRole);
}

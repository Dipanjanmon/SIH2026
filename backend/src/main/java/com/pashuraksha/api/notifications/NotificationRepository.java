package com.pashuraksha.api.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientRoleOrderBySentAtDesc(String role);

    List<Notification> findByDistrictOrderBySentAtDesc(String district);

    List<Notification> findByStatusOrderBySentAtDesc(Notification.NotificationStatus status);

    List<Notification> findByRelatedCaseId(Long caseId);

    List<Notification> findTop50ByOrderBySentAtDesc();
}

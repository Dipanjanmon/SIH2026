package com.pashuraksha.api.notifications;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String recipientPhone;

    private String recipientName;

    private String recipientRole;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    private String subject;

    private String district;

    private Long relatedCaseId;

    private Long relatedAlertId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.SENT;

    @Column(nullable = false)
    @Builder.Default
    private String channel = "SMS";

    @CreationTimestamp
    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    public enum NotificationType {
        DISEASE_ALERT,
        OUTBREAK_WARNING,
        VACCINATION_REMINDER,
        LAB_RESULT,
        CASE_UPDATE,
        GENERAL
    }

    public enum NotificationStatus {
        QUEUED,
        SENT,
        DELIVERED,
        FAILED
    }
}

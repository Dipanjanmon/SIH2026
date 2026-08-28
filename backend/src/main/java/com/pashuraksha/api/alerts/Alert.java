package com.pashuraksha.api.alerts;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    private Double latitude;
    private Double longitude;

    private String district;
    private String village;

    @Builder.Default
    private Boolean isRead = false;

    private String targetRole;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum AlertSeverity {
        INFO, WARNING, HIGH, CRITICAL
    }

    public enum AlertType {
        OUTBREAK, RISK, VACCINATION, GENERAL
    }
}

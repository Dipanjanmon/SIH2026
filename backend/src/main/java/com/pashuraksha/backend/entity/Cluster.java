package com.pashuraksha.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clusters")
public class Cluster {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID clusterId;
    
    private String customId; 
    
    private Double centerLatitude;
    private Double centerLongitude;
    private Double radiusKm;
    
    private Integer caseCount;
    private Integer farmCount;
    
    private Double riskScore;
    private String riskLevel;
    
    private String status; 
    
    private LocalDateTime detectedAt;
    
    @PrePersist
    protected void onCreate() {
        detectedAt = LocalDateTime.now();
        if(status == null) status = "DETECTED";
    }
}

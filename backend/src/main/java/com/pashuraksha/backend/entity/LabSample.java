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
@Table(name = "lab_samples")
public class LabSample {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID sampleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private DiseaseCase diseaseCase;
    
    private String sampleType; 
    private String assignedLab;
    
    private String status; 
    private String testResult; 
    private String pathogenIdentified;
    
    private LocalDateTime collectedAt;
    private LocalDateTime resultAvailableAt;
    
    @PrePersist
    protected void onCreate() {
        collectedAt = LocalDateTime.now();
        if(status == null) status = "COLLECTED";
    }
}

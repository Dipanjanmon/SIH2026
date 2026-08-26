package com.pashuraksha.backend.entity;

import com.pashuraksha.backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "disease_cases")
public class DiseaseCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID caseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    private Integer affectedCount;
    private Integer mortality;
    private Integer symptomDurationDays;
    private String observedNotes;
    
    @ManyToMany
    @JoinTable(
        name = "case_symptoms",
        joinColumns = @JoinColumn(name = "case_id"),
        inverseJoinColumns = @JoinColumn(name = "symptom_id")
    )
    private List<Symptom> symptoms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;
    
    private Double riskScore;
    private String riskLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = CaseStatus.REPORTED;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

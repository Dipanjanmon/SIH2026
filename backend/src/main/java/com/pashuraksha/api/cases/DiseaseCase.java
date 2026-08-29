package com.pashuraksha.api.cases;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "disease_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DiseaseCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String caseNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "animal_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private com.pashuraksha.api.animals.Animal animalId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private com.pashuraksha.api.auth.User reportedBy;

    @Column(columnDefinition = "text")
    private String symptoms;

    public String[] getSymptomsArray() {
        return symptoms != null ? symptoms.split(",") : new String[0];
    }

    public void setSymptomsFromArray(String[] arr) {
        this.symptoms = arr != null ? String.join(",", arr) : null;
    }

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.REPORTED;

    private Double riskScore;

    private String riskLevel;

    private String diseaseName;

    private Double latitude;
    private Double longitude;

    @JdbcTypeCode(SqlTypes.GEOMETRY)
    @Column(columnDefinition = "geometry(Point, 4326)")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.locationtech.jts.geom.Point location;

    private String village;
    private String block;
    private String district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "veterinarian_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private com.pashuraksha.api.auth.User veterinarian;

    @CreationTimestamp
    private LocalDateTime reportedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum CaseStatus {
        REPORTED, ASSIGNED, IN_PROGRESS, CONFIRMED, RECOVERED, DECEASED
    }
}

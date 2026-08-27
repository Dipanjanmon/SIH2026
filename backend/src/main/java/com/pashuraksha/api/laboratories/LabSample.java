package com.pashuraksha.api.laboratories;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_samples")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sampleNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private com.pashuraksha.api.cases.DiseaseCase caseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SampleType sampleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SampleStatus status = SampleStatus.COLLECTED;

    @Enumerated(EnumType.STRING)
    private TestResult result;

    private String diseaseDetected;

    private LocalDateTime testedAt;

    @CreationTimestamp
    private LocalDateTime collectedAt;

    private String labNotes;

    public enum SampleType {
        BLOOD, SWAB, TISSUE, FECES, OTHER
    }

    public enum SampleStatus {
        COLLECTED, IN_TRANSIT, RECEIVED, TESTING, COMPLETED
    }

    public enum TestResult {
        POSITIVE, NEGATIVE, INCONCLUSIVE
    }
}

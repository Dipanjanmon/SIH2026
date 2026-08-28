package com.pashuraksha.api.vaccinations;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private com.pashuraksha.api.animals.Animal animalId;

    @Column(nullable = false)
    private String vaccineName;

    private String batchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administered_by")
    private com.pashuraksha.api.auth.User administeredBy;

    private Integer doseNumber;

    @CreationTimestamp
    private LocalDateTime administeredAt;

    private LocalDateTime nextDoseDate;

    private String notes;
}

package com.pashuraksha.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "animals")
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID animalId;

    @Column(unique = true)
    private String tagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    private String species;
    private String breed;
    private String sex;
    private LocalDate dateOfBirth;

    @Builder.Default
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, SICK, UNDER_OBSERVATION, RECOVERED, DECEASED
}

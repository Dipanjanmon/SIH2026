package com.pashuraksha.api.animals;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "animals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String tagNumber;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Species species;

    private String breed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    private Integer ageMonths;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private com.pashuraksha.api.farms.Farm farmId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnimalStatus status = AnimalStatus.HEALTHY;

    private String photoUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Species {
        CATTLE, BUFFALO, GOAT, SHEEP, POULTRY, OTHER
    }

    public enum Gender {
        MALE, FEMALE
    }

    public enum AnimalStatus {
        HEALTHY, SICK, RECOVERED, DECEASED
    }
}

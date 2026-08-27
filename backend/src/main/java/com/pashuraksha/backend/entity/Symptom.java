package com.pashuraksha.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "symptoms")
public class Symptom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID symptomId;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
}

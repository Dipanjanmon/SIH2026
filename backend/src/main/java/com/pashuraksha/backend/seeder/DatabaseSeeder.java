package com.pashuraksha.backend.seeder;

import com.pashuraksha.backend.entity.*;
import com.pashuraksha.backend.repository.*;
import com.pashuraksha.backend.user.Role;
import com.pashuraksha.backend.user.User;
import com.pashuraksha.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final SymptomRepository symptomRepository;
    private final DiseaseCaseRepository caseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding Database for SIH Prototype...");

        // 1. Create Users
        User admin = User.builder()
                .name("State Director")
                .email("director.ahd@pashuraksha.gov")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN).build();
        userRepository.save(admin);

        User vet = User.builder()
                .name("Dr. Ramesh Kumar")
                .email("vet@pashuraksha.gov")
                .password(passwordEncoder.encode("password"))
                .role(Role.VETERINARIAN).build();
        userRepository.save(vet);

        User farmerUser = User.builder()
                .name("Kisan Singh")
                .email("farmer@pashuraksha.local")
                .password(passwordEncoder.encode("password"))
                .role(Role.FARMER).build();
        userRepository.save(farmerUser);

        // 2. Create Farmer Entity
        Farmer farmer1 = Farmer.builder()
                .name("Kisan Singh")
                .phone("9876543210")
                .village("Palghar")
                .district("Palghar")
                .build();
        farmer1 = farmerRepository.save(farmer1);
        
        Farmer farmer2 = Farmer.builder()
                .name("Amit Patel")
                .phone("9998887776")
                .village("Boisar")
                .district("Palghar")
                .build();
        farmer2 = farmerRepository.save(farmer2);

        // 3. Create Farm
        Farm farm1 = Farm.builder()
                .farmer(farmer1)
                .farmName("Singh Dairy")
                .farmType("DAIRY")
                .villageId("VIL_01")
                .latitude(19.6960)
                .longitude(72.7655)
                .livestockCount(42)
                .build();
        farm1 = farmRepository.save(farm1);

        Farm farm2 = Farm.builder()
                .farmer(farmer2)
                .farmName("Green Pastures")
                .farmType("POULTRY")
                .villageId("VIL_02")
                .latitude(19.7990)
                .longitude(72.7625)
                .livestockCount(150)
                .build();
        farm2 = farmRepository.save(farm2);

        // 4. Create Symptoms
        Symptom fever = symptomRepository.save(Symptom.builder().name("FEVER").description("High body temperature").build());
        Symptom limping = symptomRepository.save(Symptom.builder().name("LIMPING").description("Difficulty walking").build());
        Symptom blisters = symptomRepository.save(Symptom.builder().name("MOUTH_BLISTERS").description("Lesions in mouth").build());

        // 5. Create Simulated Outbreak Cases
        DiseaseCase case1 = DiseaseCase.builder()
                .farm(farm1)
                .affectedCount(4)
                .mortality(0)
                .symptomDurationDays(2)
                .status(CaseStatus.UNDER_INVESTIGATION)
                .riskScore(85.0)
                .riskLevel("CRITICAL")
                .symptoms(List.of(fever, blisters))
                .build();
        caseRepository.save(case1);

        DiseaseCase case2 = DiseaseCase.builder()
                .farm(farm2)
                .affectedCount(12)
                .mortality(1)
                .symptomDurationDays(4)
                .status(CaseStatus.REPORTED)
                .riskScore(92.0)
                .riskLevel("CRITICAL")
                .symptoms(List.of(fever, blisters, limping))
                .build();
        caseRepository.save(case2);
        
        System.out.println("Seeding Complete!");
    }
}

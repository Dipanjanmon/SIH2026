package com.pashuraksha.api.seeder;

import com.pashuraksha.api.alerts.Alert;
import com.pashuraksha.api.alerts.AlertRepository;
import com.pashuraksha.api.animals.Animal;
import com.pashuraksha.api.animals.AnimalRepository;
import com.pashuraksha.api.auth.User;
import com.pashuraksha.api.auth.UserRepository;
import com.pashuraksha.api.cases.DiseaseCase;
import com.pashuraksha.api.cases.DiseaseCaseRepository;
import com.pashuraksha.api.farmers.Farmer;
import com.pashuraksha.api.farmers.FarmerRepository;
import com.pashuraksha.api.farms.Farm;
import com.pashuraksha.api.farms.FarmRepository;
import com.pashuraksha.api.vaccinations.Vaccination;
import com.pashuraksha.api.vaccinations.VaccinationRepository;
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
    private final AnimalRepository animalRepository;
    private final DiseaseCaseRepository caseRepository;
    private final AlertRepository alertRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("[Seeder] Database already has data. Skipping.");
            return;
        }

        System.out.println("[Seeder] Seeding PashuRaksha demo data...");

        // --- Users (10) ---
        User admin = saveUser("admin", "admin@pashuraksha.gov.in", "admin123", User.Role.ADMIN);
        User govt1 = saveUser("govt1", "govt1@pashuraksha.gov.in", "govt123", User.Role.GOVT_OFFICIAL);
        User vet1 = saveUser("vet1", "vet1@pashuraksha.gov.in", "vet123", User.Role.VETERINARIAN);
        User vet2 = saveUser("vet2", "vet2@pashuraksha.gov.in", "vet123", User.Role.VETERINARIAN);
        User field1 = saveUser("field1", "field1@pashuraksha.gov.in", "field123", User.Role.FIELD_OFFICER);
        User field2 = saveUser("field2", "field2@pashuraksha.gov.in", "field123", User.Role.FIELD_OFFICER);
        User farmerUser1 = saveUser("farmer1", "farmer1@gmail.com", "farmer123", User.Role.FARMER);
        User farmerUser2 = saveUser("farmer2", "farmer2@gmail.com", "farmer123", User.Role.FARMER);
        User farmerUser3 = saveUser("farmer3", "farmer3@gmail.com", "farmer123", User.Role.FARMER);
        User lab1 = saveUser("lab1", "lab1@pashuraksha.gov.in", "lab123", User.Role.LAB_TECHNICIAN);

        // --- Farmers (3) ---
        Farmer f1 = saveFarmer(farmerUser1, "Ramesh", "Yadav", "9876543215", "Palghar", "Palghar", "Palghar", "Maharashtra");
        Farmer f2 = saveFarmer(farmerUser2, "Gopal", "Krishna", "9876543216", "Boisar", "Palghar", "Palghar", "Maharashtra");
        Farmer f3 = saveFarmer(farmerUser3, "Lakshmi", "Bai", "9876543217", "Sinnar", "Sinnar", "Nashik", "Maharashtra");

        // --- Farms (5 across Maharashtra) ---
        Farm farm1 = saveFarm(f1, "Yadav Dairy", "Palghar", "Palghar", "Palghar", "Maharashtra", 19.6967, 72.7699, 12);
        Farm farm2 = saveFarm(f2, "Krishna Cattle Farm", "Boisar", "Palghar", "Palghar", "Maharashtra", 19.8012, 72.7561, 25);
        Farm farm3 = saveFarm(f3, "Bai Goat Farm", "Sinnar", "Sinnar", "Nashik", "Maharashtra", 19.8419, 73.9971, 60);
        Farm farm4 = saveFarm(f1, "Yadav Buffalo Shed", "Vasai", "Vasai", "Palghar", "Maharashtra", 19.3919, 72.8397, 8);
        Farm farm5 = saveFarm(f2, "Krishna Poultry", "Dahanu", "Dahanu", "Palghar", "Maharashtra", 19.9726, 72.7459, 200);

        // --- Animals (15) ---
        Animal a1 = saveAnimal("MH-PAL-001", "Ganga", Animal.Species.BUFFALO, "Murrah", Animal.Gender.FEMALE, farm1);
        Animal a2 = saveAnimal("MH-PAL-002", "Yamuna", Animal.Species.BUFFALO, "Murrah", Animal.Gender.FEMALE, farm1);
        Animal a3 = saveAnimal("MH-PAL-003", "Nandi", Animal.Species.CATTLE, "Gir", Animal.Gender.MALE, farm1);
        Animal a4 = saveAnimal("MH-PAL-004", "Lakshmi", Animal.Species.CATTLE, "HF Cross", Animal.Gender.FEMALE, farm2);
        Animal a5 = saveAnimal("MH-PAL-005", "Radha", Animal.Species.CATTLE, "Jersey", Animal.Gender.FEMALE, farm2);
        Animal a6 = saveAnimal("MH-PAL-006", "Shyam", Animal.Species.CATTLE, "Indigenous", Animal.Gender.MALE, farm2);
        Animal a7 = saveAnimal("MH-NSK-001", "Mogra", Animal.Species.GOAT, "Osmanabadi", Animal.Gender.FEMALE, farm3);
        Animal a8 = saveAnimal("MH-NSK-002", "Chintu", Animal.Species.GOAT, "Osmanabadi", Animal.Gender.MALE, farm3);
        Animal a9 = saveAnimal("MH-NSK-003", "Gauri", Animal.Species.GOAT, "Sirohi", Animal.Gender.FEMALE, farm3);
        Animal a10 = saveAnimal("MH-VAS-001", "Bhola", Animal.Species.BUFFALO, "Surti", Animal.Gender.MALE, farm4);
        Animal a11 = saveAnimal("MH-VAS-002", "Kamla", Animal.Species.BUFFALO, "Jaffarabadi", Animal.Gender.FEMALE, farm4);
        Animal a12 = saveAnimal("MH-PAL-007", "Sita", Animal.Species.CATTLE, "Sahiwal", Animal.Gender.FEMALE, farm2);
        Animal a13 = saveAnimal("MH-NSK-004", "Raju", Animal.Species.GOAT, "Jamunapari", Animal.Gender.MALE, farm3);
        Animal a14 = saveAnimal("MH-PAL-008", "Gauri2", Animal.Species.CATTLE, "HF Cross", Animal.Gender.FEMALE, farm2);
        Animal a15 = saveAnimal("MH-PAL-009", "Meena", Animal.Species.CATTLE, "Jersey", Animal.Gender.FEMALE, farm1);

        // --- Disease Cases (12 â€” forming clusters in Palghar + Nashik) ---
        // Palghar FMD cluster (5 cases within 5km)
        saveCase("CASE-2026-0001", vet1, a1, "Foot and Mouth Disease", (String.join(",", "fever", "salivation", "oral_lesions", "lameness")),
                DiseaseCase.Severity.HIGH, DiseaseCase.CaseStatus.CONFIRMED, 85.0, "HIGH",
                19.6967, 72.7699, "Palghar", "Palghar", "Palghar", 10);
        saveCase("CASE-2026-0002", vet1, a2, "Foot and Mouth Disease", (String.join(",", "fever", "oral_lesions", "reduced_appetite")),
                DiseaseCase.Severity.MEDIUM, DiseaseCase.CaseStatus.CONFIRMED, 62.0, "MEDIUM",
                19.7012, 72.7735, "Palghar", "Palghar", "Palghar", 8);
        saveCase("CASE-2026-0003", field1, a4, "Foot and Mouth Disease", (String.join(",", "fever", "salivation", "lameness")),
                DiseaseCase.Severity.HIGH, DiseaseCase.CaseStatus.ASSIGNED, 78.0, "HIGH",
                19.8012, 72.7561, "Boisar", "Palghar", "Palghar", 5);
        saveCase("CASE-2026-0004", field1, a5, "Foot and Mouth Disease", (String.join(",", "fever", "oral_lesions")),
                DiseaseCase.Severity.MEDIUM, DiseaseCase.CaseStatus.REPORTED, 55.0, "MEDIUM",
                19.8050, 72.7590, "Boisar", "Palghar", "Palghar", 3);
        saveCase("CASE-2026-0005", vet1, a6, "Foot and Mouth Disease", (String.join(",", "fever", "salivation", "oral_lesions", "lameness")),
                DiseaseCase.Severity.CRITICAL, DiseaseCase.CaseStatus.CONFIRMED, 92.0, "CRITICAL",
                19.7800, 72.7650, "Boisar", "Palghar", "Palghar", 2);

        // Nashik PPR cluster (3 cases in goats)
        saveCase("CASE-2026-0006", field2, a7, "Peste des Petits Ruminants", (String.join(",", "fever", "nasal_discharge", "diarrhea")),
                DiseaseCase.Severity.CRITICAL, DiseaseCase.CaseStatus.REPORTED, 88.0, "CRITICAL",
                19.8419, 73.9971, "Sinnar", "Sinnar", "Nashik", 4);
        saveCase("CASE-2026-0007", field2, a8, "Peste des Petits Ruminants", (String.join(",", "fever", "coughing", "nasal_discharge", "diarrhea")),
                DiseaseCase.Severity.HIGH, DiseaseCase.CaseStatus.REPORTED, 75.0, "HIGH",
                19.8450, 74.0010, "Sinnar", "Sinnar", "Nashik", 3);
        saveCase("CASE-2026-0008", field2, a9, "Peste des Petits Ruminants", (String.join(",", "fever", "eye_discharge", "reduced_appetite")),
                DiseaseCase.Severity.MEDIUM, DiseaseCase.CaseStatus.ASSIGNED, 58.0, "MEDIUM",
                19.8380, 73.9930, "Sinnar", "Sinnar", "Nashik", 6);

        // Scattered cases
        saveCase("CASE-2026-0009", vet2, a10, "Lumpy Skin Disease", (String.join(",", "fever", "skin_lesions", "swelling")),
                DiseaseCase.Severity.MEDIUM, DiseaseCase.CaseStatus.IN_PROGRESS, 45.0, "MEDIUM",
                19.3919, 72.8397, "Vasai", "Vasai", "Palghar", 7);
        saveCase("CASE-2026-0010", vet2, a11, "Mastitis", (String.join(",", "fever", "milk_reduction", "swelling")),
                DiseaseCase.Severity.LOW, DiseaseCase.CaseStatus.RECOVERED, 30.0, "LOW",
                19.3950, 72.8420, "Vasai", "Vasai", "Palghar", 14);
        saveCase("CASE-2026-0011", vet1, a15, "Lumpy Skin Disease", (String.join(",", "skin_lesions", "fever", "reduced_appetite")),
                DiseaseCase.Severity.HIGH, DiseaseCase.CaseStatus.CONFIRMED, 72.0, "HIGH",
                19.7000, 72.7720, "Palghar", "Palghar", "Palghar", 1);
        saveCase("CASE-2026-0012", field1, a12, "Hemorrhagic Septicemia", (String.join(",", "fever", "swelling", "difficulty_breathing")),
                DiseaseCase.Severity.CRITICAL, DiseaseCase.CaseStatus.DECEASED, 95.0, "CRITICAL",
                19.8100, 72.7600, "Boisar", "Palghar", "Palghar", 12);

        // --- Alerts (5) ---
        saveAlert("FMD Outbreak â€” Palghar District",
                "5 confirmed Foot and Mouth Disease cases within 10km radius in Palghar block. Ring vaccination and quarantine recommended.",
                Alert.AlertSeverity.CRITICAL, Alert.AlertType.OUTBREAK, "VETERINARIAN", "Palghar", 19.7500, 72.7650);
        saveAlert("PPR Cluster â€” Nashik (Sinnar)",
                "3 Peste des Petits Ruminants cases detected in goat flocks at Sinnar. Flock quarantine advised. Vaccination drive needed.",
                Alert.AlertSeverity.HIGH, Alert.AlertType.OUTBREAK, "FIELD_OFFICER", "Nashik", 19.8419, 73.9971);
        saveAlert("LSD Case â€” Vasai",
                "Lumpy Skin Disease confirmed in buffalo at Vasai. Vector control measures recommended.",
                Alert.AlertSeverity.WARNING, Alert.AlertType.RISK, "VETERINARIAN", "Palghar", 19.3919, 72.8397);
        saveAlert("HS Mortality â€” Boisar",
                "Hemorrhagic Septicemia suspected death at Boisar farm. Urgent post-mortem and herd vaccination required.",
                Alert.AlertSeverity.CRITICAL, Alert.AlertType.OUTBREAK, "GOVT_OFFICIAL", "Palghar", 19.8100, 72.7600);
        saveAlert("Vaccination Drive Reminder",
                "FMD vaccination due for Palghar block. 45 animals pending booster dose.",
                Alert.AlertSeverity.INFO, Alert.AlertType.VACCINATION, "FARMER", "Palghar", 19.6967, 72.7699);

        // --- Vaccinations (8) ---
        saveVaccination(a1, "FMD Vaccine (Raksha Ovac)", "FMD-2026-A1", vet1);
        saveVaccination(a2, "FMD Vaccine (Raksha Ovac)", "FMD-2026-A1", vet1);
        saveVaccination(a3, "FMD Vaccine (Raksha Ovac)", "FMD-2026-A1", vet1);
        saveVaccination(a4, "FMD Vaccine (Raksha Ovac)", "FMD-2026-B2", vet1);
        saveVaccination(a7, "PPR Vaccine (Sungri/96)", "PPR-2026-C1", field2);
        saveVaccination(a8, "PPR Vaccine (Sungri/96)", "PPR-2026-C1", field2);
        saveVaccination(a10, "HS Vaccine (Alum-precipitated)", "HS-2026-D1", vet2);
        saveVaccination(a11, "BQ Vaccine (Bacterin)", "BQ-2026-E1", vet2);

        System.out.println("[Seeder] Demo data seeded successfully!");
        System.out.println("  Users: 10 | Farmers: 3 | Farms: 5 | Animals: 15");
        System.out.println("  Cases: 12 | Alerts: 5 | Vaccinations: 8");
    }

    // --- Helper methods ---

    private User saveUser(String username, String email, String password, User.Role role) {
        return userRepository.save(User.builder()
                .username(username).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).build());
    }

    private Farmer saveFarmer(User user, String firstName, String lastName, String phone,
                              String village, String block, String district, String state) {
        return farmerRepository.save(Farmer.builder()
                .userId(user).firstName(firstName).lastName(lastName).phone(phone)
                .village(village).block(block).district(district).state(state).build());
    }

    private Farm saveFarm(Farmer owner, String name, String village, String block,
                          String district, String state, double lat, double lng, int animals) {
        return farmRepository.save(Farm.builder()
                .farmerId(owner).name(name).village(village).block(block)
                .district(district).state(state).latitude(lat).longitude(lng)
                .totalAnimals(animals).build());
    }

    private Animal saveAnimal(String tag, String name, Animal.Species species, String breed,
                              Animal.Gender gender, Farm farm) {
        return animalRepository.save(Animal.builder()
                .tagNumber(tag).name(name).species(species).breed(breed)
                .gender(gender).farmId(farm).build());
    }

    private void saveCase(String caseNumber, User reporter, Animal animal, String diseaseName,
                          String symptoms, DiseaseCase.Severity severity, DiseaseCase.CaseStatus status,
                          double riskScore, String riskLevel,
                          double lat, double lng, String village, String block, String district, int daysAgo) {
        DiseaseCase dc = DiseaseCase.builder()
                .caseNumber(caseNumber).reportedBy(reporter).animalId(animal)
                .diseaseName(diseaseName).symptoms(symptoms)
                .severity(severity).status(status)
                .riskScore(riskScore).riskLevel(riskLevel)
                .latitude(lat).longitude(lng)
                .village(village).block(block).district(district)
                .build();
        caseRepository.save(dc);
    }

    private void saveAlert(String title, String message, Alert.AlertSeverity severity,
                           Alert.AlertType type, String targetRole, String district, double lat, double lng) {
        alertRepository.save(Alert.builder()
                .title(title).message(message).severity(severity).type(type)
                .targetRole(targetRole).district(district)
                .latitude(lat).longitude(lng).build());
    }

    private void saveVaccination(Animal animal, String vaccineName, String batchNumber,
                                 User administeredBy) {
        vaccinationRepository.save(Vaccination.builder()
                .animalId(animal).vaccineName(vaccineName).batchNumber(batchNumber)
                .administeredBy(administeredBy).build());
    }
}


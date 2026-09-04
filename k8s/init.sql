-- =============================================
-- PashuRaksha - Livestock Health Surveillance System
-- PostgreSQL + PostGIS Database Schema
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'VETERINARIAN', 'FIELD_OFFICER', 'FARMER', 'LAB_TECHNICIAN', 'GOVT_OFFICIAL');
CREATE TYPE case_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE case_status AS ENUM ('REPORTED', 'UNDER_INVESTIGATION', 'CONFIRMED', 'TREATED', 'RECOVERED', 'DEAD', 'FALSE_POSITIVE');
CREATE TYPE animal_gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE animal_status AS ENUM ('ALIVE', 'DEAD', 'SLAUGHTERED', 'SOLD', 'LOST');
CREATE TYPE lab_status AS ENUM ('PENDING', 'COLLECTED', 'IN_TRANSIT', 'RECEIVED', 'TESTING', 'COMPLETED', 'FAILED');
CREATE TYPE lab_result AS ENUM ('PENDING', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE');
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED');
CREATE TYPE vaccination_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED');
CREATE TYPE farm_type AS ENUM ('DAIRY', 'POULTRY', 'BUFFALO', 'GOAT', 'SHEEP', 'PIG', 'MIXED', 'OTHER');

-- =============================================
-- TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    enabled BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (PostGIS-enabled)
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    block VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    geometry GEOMETRY(Point, 4326),
    boundary GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmers table
CREATE TABLE farmers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_number VARCHAR(12),
    caste_category VARCHAR(20),
    landholdings_hectares DECIMAL(8, 2),
    annual_income DECIMAL(12, 2),
    location_id BIGINT REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    farm_type farm_type NOT NULL,
    owner_id BIGINT REFERENCES farmers(id),
    location_id BIGINT REFERENCES locations(id),
    total_area_hectares DECIMAL(8, 2),
    capacity INTEGER,
    is_registered BOOLEAN DEFAULT TRUE,
    registration_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE animals (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tag_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    gender animal_gender NOT NULL,
    date_of_birth DATE,
    weight_kg DECIMAL(8, 2),
    status animal_status DEFAULT 'ALIVE',
    farm_id BIGINT REFERENCES farms(id),
    owner_id BIGINT REFERENCES farmers(id),
    location_id BIGINT REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease cases table (PostGIS-enabled for case location)
CREATE TABLE disease_cases (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    case_number VARCHAR(30) UNIQUE NOT NULL,
    reported_by BIGINT REFERENCES users(id),
    animal_id BIGINT REFERENCES animals(id),
    disease_name VARCHAR(100) NOT NULL,
    symptoms TEXT[],
    severity case_severity NOT NULL,
    status case_status DEFAULT 'REPORTED',
    description TEXT,
    location_id BIGINT REFERENCES locations(id),
    case_location GEOMETRY(Point, 4326),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    village VARCHAR(100),
    block VARCHAR(100),
    district VARCHAR(100),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    risk_score DECIMAL(5, 2),
    risk_level VARCHAR(20),
    is_cluster BOOLEAN DEFAULT FALSE,
    cluster_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccinations table
CREATE TABLE vaccinations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    animal_id BIGINT REFERENCES animals(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(100) NOT NULL,
    disease_prevented VARCHAR(100) NOT NULL,
    batch_number VARCHAR(50),
    dose_number INTEGER DEFAULT 1,
    administered_by BIGINT REFERENCES users(id),
    administrator_name VARCHAR(100),
    administration_date DATE NOT NULL,
    next_dose_date DATE,
    expiry_date DATE,
    status vaccination_status DEFAULT 'COMPLETED',
    location_id BIGINT REFERENCES locations(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab samples table
CREATE TABLE lab_samples (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    sample_id VARCHAR(50) UNIQUE NOT NULL,
    case_id BIGINT REFERENCES disease_cases(id),
    animal_id BIGINT REFERENCES animals(id),
    sample_type VARCHAR(50) NOT NULL,
    collected_by BIGINT REFERENCES users(id),
    collector_name VARCHAR(100),
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lab_name VARCHAR(100),
    lab_location_id BIGINT REFERENCES locations(id),
    status lab_status DEFAULT 'PENDING',
    result lab_result DEFAULT 'PENDING',
    result_details TEXT,
    result_date TIMESTAMP WITH TIME ZONE,
    storage_condition VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity case_severity NOT NULL,
    status alert_status DEFAULT 'ACTIVE',
    created_by BIGINT REFERENCES users(id),
    target_role user_role,
    target_users BIGINT[],
    related_case_id BIGINT REFERENCES disease_cases(id),
    related_cluster_id VARCHAR(50),
    location_id BIGINT REFERENCES locations(id),
    radius_km DECIMAL(5, 2),
    acknowledged_by BIGINT REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Spatial indexes
CREATE INDEX idx_locations_geometry ON locations USING GIST (geometry);
CREATE INDEX idx_locations_boundary ON locations USING GIST (boundary);
CREATE INDEX idx_cases_location ON disease_cases USING GIST (case_location);

-- Query performance indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_location_id ON farms(location_id);
CREATE INDEX idx_animals_farm_id ON animals(farm_id);
CREATE INDEX idx_animals_owner_id ON animals(owner_id);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_tag_number ON animals(tag_number);

CREATE INDEX idx_cases_reported_by ON disease_cases(reported_by);
CREATE INDEX idx_cases_animal_id ON disease_cases(animal_id);
CREATE INDEX idx_cases_disease_name ON disease_cases(disease_name);
CREATE INDEX idx_cases_severity ON disease_cases(severity);
CREATE INDEX idx_cases_status ON disease_cases(status);
CREATE INDEX idx_cases_reported_at ON disease_cases(reported_at DESC);
CREATE INDEX idx_cases_district ON disease_cases(district);
CREATE INDEX idx_cases_village ON disease_cases(village);
CREATE INDEX idx_cases_risk_level ON disease_cases(risk_level);
CREATE INDEX idx_cases_cluster_id ON disease_cases(cluster_id);

CREATE INDEX idx_vaccinations_animal_id ON vaccinations(animal_id);
CREATE INDEX idx_vaccinations_admin_date ON vaccinations(administration_date DESC);
CREATE INDEX idx_vaccinations_vaccine ON vaccinations(vaccine_name);
CREATE INDEX idx_vaccinations_status ON vaccinations(status);

CREATE INDEX idx_lab_samples_case_id ON lab_samples(case_id);
CREATE INDEX idx_lab_samples_animal_id ON lab_samples(animal_id);
CREATE INDEX idx_lab_samples_status ON lab_samples(status);
CREATE INDEX idx_lab_samples_result ON lab_samples(result);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_target_role ON alerts(target_role);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_expires_at ON alerts(expires_at);

-- =============================================
-- TRIGGER: Auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON disease_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_samples_updated_at BEFORE UPDATE ON lab_samples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Sample Users (passwords: admin123, vet123, field123, farmer123, lab123, govt123)
INSERT INTO users (username, email, password, full_name, role, phone) VALUES
('admin', 'admin@pashuraksha.gov.in', '$2b$10$Xtfp05NtI0vUWyEtXYc3E.1F14Lcjn4qNrvTDD06eMHAnfCJTdgMW', 'Dr. Rajesh Kumar', 'ADMIN', '+91-9876543210'),
('vet1', 'vet1@pashuraksha.gov.in', '$2b$10$9/JvJAw6A0vN9/ee2j1uoe3OmCWXr98o/4kIYjPtARNtF9ZpynjQ2', 'Dr. Priya Sharma', 'VETERINARIAN', '+91-9876543211'),
('vet2', 'vet2@pashuraksha.gov.in', '$2b$10$Acrjz39gw32rwyW3afyRvOIM5PUyuEwVHundInWgUwq32pWiWaEEa', 'Dr. Amit Singh', 'VETERINARIAN', '+91-9876543212'),
('field1', 'field1@pashuraksha.gov.in', '$2b$10$Odn2DooxiMBlAQ1mBgqRCe5j6WFkhfDAi9ThQdgHzW5/Tj86/CYpi', 'Suresh Patel', 'FIELD_OFFICER', '+91-9876543213'),
('field2', 'field2@pashuraksha.gov.in', '$2b$10$BQnF8AojT/pPgLarYaSh2efmv8zXgPyOYblI.ZfjOdmUh3aBZnUve', 'Meena Devi', 'FIELD_OFFICER', '+91-9876543214'),
('farmer1', 'farmer1@gmail.com', '$2b$10$b98cmF/XkL1zgBV3P5dbKuVsZUbWjRVvW171Fpbz.XssvbuUf0KQe', 'Ramesh Yadav', 'FARMER', '+91-9876543215'),
('farmer2', 'farmer2@gmail.com', '$2b$10$QCMkuwYwc7w/gSUM/3OqJumkxzGcUazgPq1q9tA1eEid0vzxzpp4q', 'Gopal Krishna', 'FARMER', '+91-9876543216'),
('farmer3', 'farmer3@gmail.com', '$2b$10$SFvCu04LCvrJkRfL3AqjmONCCEmO7.airDvr9y68sq5ZnZVs/vIUS', 'Lakshmi Bai', 'FARMER', '+91-9876543217'),
('lab1', 'lab1@pashuraksha.gov.in', '$2b$10$DRnehKHzANar6TfqSMH9j.D6ZS7vH90PZiwFeEJ5RrVqMwey9cB5C', 'Anita Verma', 'LAB_TECHNICIAN', '+91-9876543218'),
('govt1', 'govt1@pashuraksha.gov.in', '$2b$10$H4oR87LVOq3Sku6JV2RSnurzbZQbg2CmhDrYLtQIW7dZogk3heHPq', 'District Collector Office', 'GOVT_OFFICIAL', '+91-9876543219');

-- Sample Locations (Central India - Madhya Pradesh region)
INSERT INTO locations (name, village, block, district, state, pincode, geometry) VALUES
('Raisen Center', 'Raisen', 'Raisen', 'Raisen', 'Madhya Pradesh', '466661', ST_SetSRID(ST_MakePoint(77.7806, 23.3342), 4326)),
('Bhopal Center', 'Bhopal', 'Huzur', 'Bhopal', 'Madhya Pradesh', '462001', ST_SetSRID(ST_MakePoint(77.4126, 23.2599), 4326)),
('Vidisha Center', 'Vidisha', 'Vidisha', 'Vidisha', 'Madhya Pradesh', '464001', ST_SetSRID(ST_MakePoint(77.8145, 23.5244), 4326)),
('Sehore Center', 'Sehore', 'Sehore', 'Sehore', 'Madhya Pradesh', '466001', ST_SetSRID(ST_MakePoint(77.0851, 23.1979), 4326)),
('Narsinghpur Center', 'Narsinghpur', 'Narsinghpur', 'Narsinghpur', 'Madhya Pradesh', '487001', ST_SetSRID(ST_MakePoint(79.1913, 22.9522), 4326));

-- Sample Farmers (UUIDs auto-generated, using DEFAULT)
INSERT INTO farmers (user_id, aadhaar_number, caste_category, landholdings_hectares, annual_income, location_id) VALUES
(6, '123456789012', 'OBC', 2.5, 180000.00, 1),
(7, '234567890123', 'GENERAL', 5.0, 350000.00, 2),
(8, '345678901234', 'SC', 1.5, 120000.00, 3);

-- Sample Farms
INSERT INTO farms (name, farm_type, owner_id, location_id, total_area_hectares, capacity, registration_number) VALUES
('Ramesh Dairy Farm', 'DAIRY', 1, 1, 1.5, 25, 'MP-RAI-2024-001'),
('Krishna Dairy Farm', 'DAIRY', 2, 2, 3.0, 50, 'MP-BHO-2024-001'),
('Lakshmi Goat Farm', 'GOAT', 3, 3, 1.0, 100, 'MP-VID-2024-001');

-- Sample Animals
INSERT INTO animals (tag_number, name, species, breed, gender, date_of_birth, weight_kg, farm_id, owner_id, location_id) VALUES
('MP-RAI-001', 'Ganga', 'Buffalo', 'Murrah', 'FEMALE', '2021-03-15', 450.00, 1, 1, 1),
('MP-RAI-002', 'Yamuna', 'Buffalo', 'Murrah', 'FEMALE', '2022-01-20', 380.00, 1, 1, 1),
('MP-BHO-001', 'Sita', 'Cow', 'HF', 'FEMALE', '2020-07-10', 520.00, 2, 2, 2),
('MP-BHO-002', 'Radha', 'Cow', 'Jersey', 'FEMALE', '2021-11-05', 400.00, 2, 2, 2),
('MP-VID-001', 'Mogra', 'Goat', 'Jamunapari', 'FEMALE', '2022-06-18', 35.00, 3, 3, 3),
('MP-VID-002', 'Chintu', 'Goat', 'Jamunapari', 'MALE', '2023-02-10', 28.00, 3, 3, 3),
('MP-RAI-003', 'Shankar', 'Cow', 'Indigenous', 'MALE', '2019-09-25', 350.00, 1, 1, 1);

-- Sample Disease Cases (cluster scenario around Raisen-Bhopal region)
INSERT INTO disease_cases (case_number, reported_by, animal_id, disease_name, symptoms, severity, status, latitude, longitude, village, block, district, reported_at, risk_score, risk_level) VALUES
('CASE-2026-0001', 2, 1, 'Foot and Mouth Disease',
    ARRAY['fever', 'salivation', 'oral_lesions', 'lameness'], 'HIGH', 'CONFIRMED',
    23.3342, 77.7806, 'Raisen', 'Raisen', 'Raisen', NOW() - INTERVAL '10 days', 72.5, 'HIGH'),
('CASE-2026-0002', 2, 2, 'Foot and Mouth Disease',
    ARRAY['fever', 'oral_lesions', 'reduced_appetite'], 'MEDIUM', 'TREATED',
    23.3400, 77.7900, 'Raisen', 'Raisen', 'Raisen', NOW() - INTERVAL '8 days', 45.0, 'MEDIUM'),
('CASE-2026-0003', 3, 3, 'Brucellosis',
    ARRAY['fever', 'abortion', 'reduced_appetite'], 'HIGH', 'CONFIRMED',
    23.2599, 77.4126, 'Bhopal', 'Huzur', 'Bhopal', NOW() - INTERVAL '5 days', 68.0, 'HIGH'),
('CASE-2026-0004', 2, 4, 'Mastitis',
    ARRAY['fever', 'milk_reduction', 'swelling'], 'MEDIUM', 'UNDER_INVESTIGATION',
    23.2650, 77.4200, 'Bhopal', 'Huzur', 'Bhopal', NOW() - INTERVAL '3 days', 35.0, 'MEDIUM'),
('CASE-2026-0005', 4, 5, 'Peste des Petits Ruminants',
    ARRAY['fever', 'nasal_discharge', 'diarrhea', 'reduced_appetite'], 'CRITICAL', 'REPORTED',
    23.5244, 77.8145, 'Vidisha', 'Vidisha', 'Vidisha', NOW() - INTERVAL '1 day', 82.0, 'CRITICAL'),
('CASE-2026-0006', 4, 6, 'Peste des Petits Ruminants',
    ARRAY['fever', 'coughing', 'nasal_discharge', 'diarrhea'], 'HIGH', 'REPORTED',
    23.5300, 77.8200, 'Vidisha', 'Vidisha', 'Vidisha', NOW() - INTERVAL '2 days', 75.0, 'HIGH'),
('CASE-2026-0007', 3, 7, 'Foot and Mouth Disease',
    ARRAY['fever', 'oral_lesions', 'salivation', 'lameness'], 'CRITICAL', 'CONFIRMED',
    23.3300, 77.7750, 'Raisen', 'Raisen', 'Raisen', NOW() - INTERVAL '12 days', 88.0, 'CRITICAL'),
('CASE-2026-0008', 2, NULL, 'Lumpy Skin Disease',
    ARRAY['fever', 'skin_lesions', 'swelling', 'reduced_appetite'], 'MEDIUM', 'REPORTED',
    23.1979, 77.0851, 'Sehore', 'Sehore', 'Sehore', NOW() - INTERVAL '6 days', 42.0, 'MEDIUM');

-- Update cluster_id for cases in Raisen cluster
UPDATE disease_cases SET cluster_id = 'CL-0001' WHERE district = 'Raisen';
UPDATE disease_cases SET cluster_id = 'CL-0002' WHERE district = 'Vidisha';

-- Sample Vaccinations
INSERT INTO vaccinations (animal_id, vaccine_name, disease_prevented, batch_number, administered_by, administrator_name, administration_date, next_dose_date, status, location_id) VALUES
(1, 'FMD Vaccine', 'Foot and Mouth Disease', 'VAC-FMD-2026-A', 2, 'Dr. Priya Sharma', '2025-12-15', '2026-06-15', 'COMPLETED', 1),
(2, 'FMD Vaccine', 'Foot and Mouth Disease', 'VAC-FMD-2026-A', 2, 'Dr. Priya Sharma', '2025-12-15', '2026-06-15', 'COMPLETED', 1),
(3, 'Brucella Vaccine', 'Brucellosis', 'VAC-BRU-2026-B', 3, 'Dr. Amit Singh', '2026-01-10', '2027-01-10', 'COMPLETED', 2),
(5, 'PPR Vaccine', 'Peste des Petits Ruminants', 'VAC-PPR-2026-C', 4, 'Suresh Patel', '2026-02-20', NULL, 'COMPLETED', 3),
(6, 'PPR Vaccine', 'Peste des Petits Ruminants', 'VAC-PPR-2026-C', 4, 'Suresh Patel', '2026-02-20', NULL, 'COMPLETED', 3);

-- Sample Lab Samples
INSERT INTO lab_samples (sample_id, case_id, animal_id, sample_type, collected_by, collector_name, collection_date, lab_name, status, result, result_date) VALUES
('LAB-2026-0001', 1, 1, 'Oral Swab', 2, 'Dr. Priya Sharma', NOW() - INTERVAL '10 days', 'State Veterinary Lab Bhopal', 'COMPLETED', 'POSITIVE', NOW() - INTERVAL '8 days'),
('LAB-2026-0002', 3, 3, 'Blood Serum', 3, 'Dr. Amit Singh', NOW() - INTERVAL '5 days', 'State Veterinary Lab Bhopal', 'COMPLETED', 'POSITIVE', NOW() - INTERVAL '3 days'),
('LAB-2026-0003', 5, 5, 'Nasal Swab', 4, 'Suresh Patel', NOW() - INTERVAL '1 day', 'District Lab Vidisha', 'TESTING', 'PENDING', NULL),
('LAB-2026-0004', 6, 6, 'Blood Sample', 4, 'Suresh Patel', NOW() - INTERVAL '2 days', 'District Lab Vidisha', 'IN_TRANSIT', 'PENDING', NULL);

-- Sample Alerts
INSERT INTO alerts (title, message, alert_type, severity, status, created_by, target_role, related_case_id, related_cluster_id, location_id, radius_km, created_at) VALUES
('FMD Outbreak Alert - Raisen', 'Multiple Foot and Mouth Disease cases detected in Raisen block. 3 cases within 5km radius in last 10 days. Immediate containment measures recommended.', 'OUTBREAK', 'HIGH', 'ACTIVE', 1, 'VETERINARIAN', 1, 'CL-0001', 1, 10.0, NOW() - INTERVAL '3 days'),
('PPR Cluster Alert - Vidisha', 'Peste des Petits Ruminants cases detected in Vidisha. Growing cluster with CRITICAL severity. Vaccination drive urgently needed.', 'CLUSTER', 'CRITICAL', 'ACTIVE', 1, 'FIELD_OFFICER', 5, 'CL-0002', 3, 5.0, NOW() - INTERVAL '1 day'),
('Lab Results Ready', 'Lab results for sample LAB-2026-0002 (Brucellosis) are positive. Case confirmed. Protocol activation recommended.', 'LAB_RESULT', 'MEDIUM', 'ACKNOWLEDGED', 9, 'VETERINARIAN', 3, NULL, 2, NULL, NOW() - INTERVAL '2 days');

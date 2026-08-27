# PashuRaksha 🐄🏥

**SIH 2026 Prototype**  
**Problem Statement Code:** SIH26128  
**Title:** Intelligent Livestock Disease Surveillance & Early-Warning Web Platform  

## 📖 Overview
PashuRaksha is a web-based livestock-health surveillance and decision-support platform designed for the Department of Animal Husbandry and Dairying (AHD). 

The platform collects real-time livestock health reports from farmers and veterinary personnel. It passes this data through a Python-based intelligent risk engine to calculate severity, and employs unsupervised machine learning (DBSCAN) to dynamically identify emerging geographic outbreaks. High-risk clusters automatically trigger alerts to veterinary block officers, enabling rapid, data-driven deployment of resources before localized infections become epidemics.

## 🏗️ Architecture & Tech Stack
The platform is built as a distributed microservices-oriented architecture:

* **Frontend (User & Gov Interfaces):** React 18, Vite, Tailwind CSS, Lucide React, React-Leaflet (GIS Mapping), Recharts.
* **Backend Core (Business Logic & Auth):** Java 21, Spring Boot 3, Spring Security (JWT Stateless Auth), Spring Data JPA.
* **Intelligence Service (AI/ML Math):** Python, FastAPI, Scikit-Learn (DBSCAN Clustering with Haversine distance), Pandas.
* **Database & GIS:** PostgreSQL 15 + PostGIS extension, managed via Docker.

---

## 🚀 Core Features & Workflows

### 1. Multi-Tier Secure Authentication
* **Public Portal (`/login`):** For Farmers and Veterinarians to access their respective dashboards.
* **Hidden AHD Secure Node:** For government officials (Admins). The route is intentionally obfuscated (`/auth/department-of-ahd-login`) to prevent brute-force and unprivileged discovery.

### 2. Intelligent Risk Engine
When a farmer reports a case (e.g., Fever, Mouth Blisters), the Spring Boot backend delegates the risk calculation to the Python Intelligence Service. The Python engine calculates a risk score and risk level (e.g., `CRITICAL`, `WARNING`) based on historical mortality and symptom duration.

### 3. Spatial Clustering & Outbreak Detection
The system continually polls active disease cases. The Python ML engine utilizes **DBSCAN** clustering on the GIS coordinates (Latitude/Longitude) to detect spatial density. If an outbreak epicenter is found, a `Cluster` is formed.

### 4. Event-Driven Alert System
Detected clusters and high-risk individual cases automatically trigger actionable alerts. These alerts are dispatched to the State Dashboard and local Veterinarian dashboards for immediate triage.

### 5. Veterinary & Laboratory Triage
Vets can claim reported cases, dispatch them to labs by assigning a `LabSample`, and log the test results, updating the global state of the outbreak.

### 6. Government Surveillance Dashboard
An institutional, data-dense map and chart view replacing generic UI. Government officials can view geographic cluster distributions on interactive Leaflet maps and track epidemiological curves.

---

## 🛠️ Installation & Execution

### Prerequisites
* Docker & Docker Compose
* Java 21 (JDK) & Maven
* Python 3.10+
* Node.js 20+

### 1. Database (Docker)
```bash
docker-compose up -d
```
*This starts PostGIS on port 5432 and pgAdmin on port 5050.*

### 2. Intelligence Service (Python)
```bash
cd intelligence-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```
*Runs on port 8000.*

### 3. Backend Core (Java Spring Boot)
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```
*Runs on port 8080. On the first run, the `DatabaseSeeder` will automatically populate dummy Farms, Farmers, and FMD Outbreaks.*

### 4. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
*Runs on port 5173.*

---

## 🧪 Demo Credentials (Seeded)

The database automatically seeds the following accounts:

1. **Government Official (State Director):**
   * **URL:** `http://localhost:5173/auth/department-of-ahd-login`
   * **Email:** `director.ahd@pashuraksha.gov`
   * **Password:** `password`

2. **Farmer:**
   * **URL:** `http://localhost:5173/login`
   * **Email:** `farmer@pashuraksha.local`
   * **Password:** `password`

3. **Veterinarian:**
   * **URL:** `http://localhost:5173/login`
   * **Email:** `vet@pashuraksha.gov`
   * **Password:** `password`

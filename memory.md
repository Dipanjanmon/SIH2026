# MEMORY — PashuRaksha Project State (Updated 28 Aug 2026, Post Phase 3)

## Problem Statement
**SIH26128** — Government of Maharashtra  
"Efficient systems for early detection, prevention, and management of livestock diseases and animal health issues"  
**Category:** Agriculture, FoodTech & Rural Development  
**Deadline:** 20 September 2026

---

## Current State: ~85% Complete

### Phases Completed

| Phase | Status | What Was Done |
|-------|--------|--------------|
| Phase 1 | ✅ DONE | Merge conflicts resolved, old code removed, both frontend + backend compile clean |
| Phase 2 | ✅ DONE | AI Chat Engine (100% accuracy, 8 diseases), Real CNN Image Detection (90.6% trained, 83-90% tested), Backend proxies, ChatPage UI, Image detection in report form |
| Phase 3 | ✅ DONE | Backend→AI integration on case creation, auto-alert generation, JPA DatabaseSeeder (12 cases, 5 alerts, 15 animals, 5 farms), JSON serialization fixes, all API endpoints returning 200 |
| AI Core Fix | ✅ DONE | Chat engine v2 rewrite (100+ vocabulary, combo rules, lethal priority), Image+Chat fusion endpoint, conversation context |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│   [React 19 Frontend :5173]                                  │
│   12 pages + ChatPage + proper routing                       │
│       │ axios + JWT                                          │
│       ▼                                                      │
│   [Spring Boot 3.4 Backend :8080]                           │
│   Auth, Cases, Farms, Animals, Alerts, Labs,                │
│   Vaccinations, Analytics, Risk, Chat proxy, Image proxy    │
│       │ RestTemplate                                         │
│       ▼                                                      │
│   [Python FastAPI AI Service :5000]                          │
│   Chat Engine v2 | CNN MobileNetV2 | Fusion | Risk Engine   │
│   Cluster Detection                                          │
│       │                                                      │
│   [PostgreSQL 15 + PostGIS :5432] (Docker)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## AI System Accuracy (Tested)

| Component | Accuracy | Details |
|-----------|----------|---------|
| Chat Engine v2 | **100%** (8/8) | All 8 diseases correctly identified |
| Image Detection CNN | **90%** (18/20) | MobileNetV2, trained 12 min on RTX 3050 |
| Image+Chat Fusion | **98%** confidence | Agreement boosts, disagreement handled |
| Lethal Disease Detection | **100%** | Anthrax, HS, BQ, PPR all flagged EMERGENCY |
| Hindi Input | **100%** | bukhar, chhaale, dast, naak, sujan, gilti all working |

---

## What's Built (Detailed)

### Frontend (12 pages)
- GovDashboard (817 lines, role-specific for 6 roles, India map)
- DashboardPage (role-based sub-dashboards)
- CasesPage, CaseDetailPage
- **ChatPage** (NEW — chat bubbles, quick prompts, AI response cards)
- **ReportDiseasePage** (with AI image detection on photo upload)
- DiseaseMapPage, RiskDashboardPage, AnalyticsPage
- LaboratoryPage, VaccinationsPage, AdminPage, LoginPage
- Sidebar with "AI Advisory" link for all roles

### Backend (Java 21, Spring Boot 3.4)
- 12 controllers: Auth, Cases, Farms, Animals, Alerts, Labs, Vaccinations, Analytics, Risk, Locations, **Chat**, **Detection**
- **AiServiceClient** — RestTemplate proxy to Python AI (chat + image + fusion)
- **DatabaseSeeder** — auto-seeds 10 users, 3 farmers, 5 farms, 15 animals, 12 cases (FMD cluster Palghar, PPR cluster Nashik), 5 alerts, 8 vaccinations
- **CaseService** — on case creation: calls AI for risk scoring → auto-generates alerts for HIGH/CRITICAL
- All entities fixed with @JsonIgnoreProperties (no more 403 serialization errors)

### AI Service (Python FastAPI)
- **chat_engine.py v2** — 100+ vocabulary, 8 diseases, combo rules, lethal priority, conversation context, follow-up questions
- **image_detector.py** — Real MobileNetV2 CNN (trained on 4,367 images, 4 classes: FMD/LSD/Healthy/Mastitis)
- **Fusion endpoint** — POST /api/v1/diagnose/fusion (merges image + text predictions)
- **risk_engine.py** — 4-factor scoring (symptom + proximity + temporal + growth)
- **cluster_detection.py** — geographic clustering with Haversine
- Model file: `models/cattle_disease_mobilenetv2.pth` (90.6% val accuracy)

### Database
- PostgreSQL 15 + PostGIS (Docker container `pashuraksha_db`)
- JPA `ddl-auto=update` creates schema from entities
- Seeder populates realistic Maharashtra data on first run

### Datasets Downloaded
- `datasets/cowhealth_6k/` — 4,367 images (FMD, Healthy, Lumpy, Mastitis)
- `datasets/cattle_diseases/` — 3,244 images (FMD, Healthy, Lumpy)
- `datasets/organized/` — train/val split used for CNN training

---

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| govt1 | govt123 | GOVT_OFFICIAL |
| vet1 | vet123 | VETERINARIAN |
| vet2 | vet123 | VETERINARIAN |
| field1 | field123 | FIELD_OFFICER |
| field2 | field123 | FIELD_OFFICER |
| farmer1 | farmer123 | FARMER |
| farmer2 | farmer123 | FARMER |
| farmer3 | farmer123 | FARMER |
| lab1 | lab123 | LAB_TECHNICIAN |

---

## Known Issues

| Issue | Status | Impact |
|-------|--------|--------|
| 2/12 mild LSD images misclassified as Healthy | Minor | Need more early-stage LSD training data |
| No LLM for conversational responses | Acceptable | Keyword engine works, just not prose-style |
| GovDashboard cluster nodes are hardcoded | Phase 4 | Need to fetch from API |
| Weather/seasonal data not integrated | Phase 4 | PS explicitly asks for it |
| No offline PWA support | Phase 4 | PS mentions offline channels |
| No Hindi/Marathi UI labels | Phase 5 | Only chat input handles Hindi |

---

## How to Run

```bash
# 1. Docker (PostgreSQL)
docker compose up -d

# 2. Enable PostGIS on fresh DB
docker exec pashuraksha_db psql -U admin -d pashuraksha -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 3. AI Service
cd ai-service
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 5000

# 4. Backend
cd backend
java -jar target/pashuraksha-api-1.0.0-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/pashuraksha \
  --spring.datasource.username=admin --spring.datasource.password=password

# 5. Frontend
cd frontend
npm run dev
```

**Open:** http://localhost:5173

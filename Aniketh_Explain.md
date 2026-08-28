# PashuRaksha — Project Run Guide

**Aniketh_Explain.md**
PashuRaksha is a national-scale **Livestock Health & Disease Surveillance System** built for **Smart India Hackathon 2026**. This document explains the full project structure and how to run it.

---

## 1. Project Overview

| Item | Value |
|------|-------|
| **Project Name** | PashuRaksha |
| **Theme** | Smart Education |
| **PS Category** | Software |
| **Problem Statement** | Livestock Health Surveillance System for India's 535.78M registered animals |
| **Target Users** | Farmers, Veterinarians, Government Officers, Lab Technicians, Admins |

### What it does
- Real-time disease reporting with geo-tagged locations
- AI-powered outbreak risk scoring & cluster detection
- Interactive disease surveillance maps (district → block → village)
- Role-based dashboards for all stakeholders
- Laboratory sample tracking pipeline
- Vaccination coverage monitoring

---

## 2. Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [React Frontend]  →  [Spring Boot Backend]  →  [PostgreSQL]│
│   TypeScript + Vite     Java 21 + Security      + PostGIS   │
│       │                        │                    ▲       │
│       └──────────┬─────────────┘                    │       │
│                  ▼                                  │       │
│            [Python AI Service]                     │       │
│            FastAPI + scikit-learn ─────────────────┘       │
│            Risk Engine + Cluster Detection                │
│                                                             │
│   [Nginx] — reverse proxy serving everything on port 80    │
│   [Docker] — single all-in-one container                   │
│   [Supervisord] — runs all 4 services                      │
└─────────────────────────────────────────────────────────────┘
```

**Core technologies:**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS | All web interfaces |
| Backend | Java 21 + Spring Boot 3.4 + Spring Security + JWT | APIs, business logic, auth |
| Database | PostgreSQL 16 + PostGIS 3.x | Health data + geographic analysis |
| AI/Analytics | Python 3.10 + FastAPI + scikit-learn | Risk scoring, outbreak detection |
| Maps | Leaflet.js | Disease surveillance maps |
| Charts | Recharts + Chart.js | Analytics dashboards |
| Deployment | Docker + Nginx + Supervisord | All-in-one container |

---

## 3. Project Structure

```
SIH2026_ANi/
├── backend/                      # Spring Boot backend
│   ├── src/main/java/com/pashuraksha/api/
│   │   ├── auth/                 # AuthController, AuthService, User
│   │   ├── config/               # SecurityConfig, CORS
│   │   ├── security/             # JWT provider, filter, UserDetails
│   │   ├── controller/           # REST API controllers
│   │   ├── service/              # Business logic services
│   │   ├── repository/           # JPA repositories
│   │   ├── entity/               # Entity classes
│   │   └── dto/                  # Request/Response DTOs
│   ├── Dockerfile                # Backend build stage
│   ├── pom.xml                   # Maven dependencies
│   └── src/main/resources/application.properties
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── App.tsx               # Root routing
│   │   ├── main.tsx              # Entry point (providers)
│   │   ├── api/client.ts         # Axios with JWT interceptor
│   │   ├── components/           # LoginModal, ProtectedRoute, Layout, Sidebar
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── hooks/                # useAuth, useCases, useFacilities, useMap
│   │   ├── pages/                # All page components
│   │   └── types/                # TypeScript interfaces
│   ├── Dockerfile                # Frontend build stage
│   └── package.json
│
├── ai-service/                   # Python AI service
│   ├── main.py                   # FastAPI app
│   ├── risk_engine.py            # Rule-based risk scoring
│   ├── cluster_detection.py      # Geographic cluster detection
│   ├── requirements.txt
│   └── .env
│
├── database/
│   └── init.sql                  # PostgreSQL schema + sample data
│
├── Dockerfile                    # Multi-stage build (all in one)
├── docker-compose.yml            # Compose config
├── nginx-all-in-one.conf         # Nginx reverse proxy config
├── supervisord.conf              # Service manager config
├── entrypoint.sh                 # Startup script
└── check.html / loging.html      # Reference HTML files
```

---

## 4. How to Run (Docker — Recommended)

### Prerequisites
- **Docker** installed and **Docker Desktop running**
- Port **80** free on your machine

### Step 1: Start Docker Desktop
Open Docker Desktop from Start Menu and wait until it shows **"Engine running"**.

### Step 2: Open Terminal
Open PowerShell / CMD and navigate to the project:

```powershell
cd C:\Users\Aniketh\Desktop\SIH2026_ANi
```

### Step 3: Build & Start the Container
```powershell
docker compose up --build -d
```
> `--build` rebuilds the image (Run once or whenever code changes)
> `-d` runs in background

**First build takes 5–10 minutes** (downloads Node, Maven, PostgreSQL images).

### Step 4: Verify it's running
```powershell
docker ps
```
You should see `SIH2026_ANI` with status **Up** and port `0.0.0.0:80->80`.

### Step 5: Check logs (optional)
```powershell
docker logs SIH2026_ANI
```

### Step 6: Open in Browser
Open your browser and go to: **http://localhost**

---

## 5. Login Credentials

The database seeds 10 users. All passwords are the username + `123`.

| Username | Password | Role | Full Name |
|----------|----------|------|-----------|
| `admin` | `admin123` | ADMIN | Dr. Rajesh Kumar |
| `govt1` | `govt123` | GOVT_OFFICIAL | District Collector Office |
| `vet1` | `vet123` | VETERINARIAN | Dr. Priya Sharma |
| `vet2` | `vet123` | VETERINARIAN | Dr. Amit Singh |
| `field1` | `field123` | FIELD_OFFICER | Suresh Patel |
| `field2` | `field123` | FIELD_OFFICER | Meena Devi |
| `farmer1` | `farmer123` | FARMER | Ramesh Yadav |
| `farmer2` | `farmer123` | FARMER | Gopal Krishna |
| `farmer3` | `farmer123` | FARMER | Lakshmi Bai |
| `lab1` | `lab123` | LAB_TECHNICIAN | Anita Verma |

**Default login:** `admin` / `admin123`

---

## 6. Login Flow (How it works)

1. Open **http://localhost** → **Login popup appears instantly**
2. You **cannot access any page** until you log in
3. Enter your credentials (`admin` / `admin123`)
4. On success → dashboard loads showing:
   - Your **username** and **role** in the header
   - Role-specific dashboard content
5. **Logout** button (logout icon) in header → clears token → login popup returns

---

## 7. Running Services Locally (Developer Mode)

If you don't want Docker, run each service separately:

### 7.1 Backend (Spring Boot)
```powershell
cd backend
mvn spring-boot:run
```
Runs on **http://localhost:8080**

### 7.2 Frontend (Vite Dev Server)
```powershell
cd frontend
npm install
npm run dev
```
Runs on **http://localhost:5173** (auto-proxies API to 8080)

### 7.3 AI Service (FastAPI)
```powershell
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000
```
Runs on **http://localhost:5000**

### 7.4 Database (PostgreSQL)
You need PostgreSQL 16 + PostGIS installed locally, then:
```powershell
psql -U postgres -f database/init.sql
```

---

## 8. Common Commands

### Stop the container
```powershell
docker compose down
```
### Stop & delete everything (fresh start)
```powershell
docker compose down -v
```
> `-v` also deletes the database volume — use for a full reset
### Rebuild after code change
```powershell
docker compose up --build -d
```
### View real-time logs
```powershell
docker logs -f SIH2026_ANI
```
### Restart container
```powershell
docker restart SIH2026_ANI
```

---

## 9. API Endpoints (Main)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login → returns JWT token |
| POST | `/api/v1/auth/register` | Register a new user |
| GET | `/api/v1/cases` | All disease cases |
| POST | `/api/v1/cases` | Report a new disease case |
| GET | `/api/v1/cases/{id}` | Case details |
| GET | `/api/v1/farms` | All farms |
| GET | `/api/v1/animals` | All animals |
| GET | `/api/v1/vaccinations` | Vaccination records |
| GET | `/api/v1/laboratory/samples` | Lab samples |
| GET | `/api/v1/risk/zones` | Risk zones |
| GET | `/api/v1/locations` | Locations (public) |

All endpoints (except `/auth/**` and `/locations/**`) require a **Bearer token** in the `Authorization` header.

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| **Login popup not showing** | Hard refresh: `Ctrl + Shift + R`, or clear browser cache |
| **"Docker daemon not running"** | Open Docker Desktop and wait for engine |
| **Port 80 in use** | Close the app using port 80, or change port in `docker-compose.yml` |
| **Login fails** | Use credentials above; check backend in logs |
| **White screen** | Check `docker logs SIH2026_ANI` for errors |
| **Backend DDL warnings** | Harmless — existing data conflicts, app still works |
| **npm install errors (dev)** | Delete `node_modules` + `package-lock.json`, reinstall |

---

## 11. Important Notes

### ⚠️ Merge Conflict in package.json
`frontend/package.json` currently contains an **unresolved Git merge conflict** (lines with `<<<<<<< HEAD` / `=======` / `>>>>>>> 75c08c9`). When you run via **Docker** it still works (npm ci uses lock), but for clean local dev, resolve it:

```json
// Keep these (merge both):
"@tanstack/react-query": "^5.102.5",
"@types/leaflet": "^1.9.22",
"jwt-decode": "^4.0.0",
"axios": "^1.20.0",
"react": "^19.2.8",
```

### Login Popup Behavior
- Login is **mandatory** — no page is accessible without it
- The popup is a **fixed modal** with no close button (by design)
- It shows the official government-style SSO authentication UI
- Uses `loging.html` design but as a proper React component

---

## 12. Architecture Diagram (Data Flow)

```
  FARMER                    GOVT OFFICER                LAB TECHNICIAN
     │                            │                          │
     ▼                            ▼                          ▼
┌─────────────┐   ┌──────────────────────────┐  ┌─────────────────────┐
│ Farmer      │   │ Government Dashboard      │  │ Lab Sample Dashboard│
│ Dashboard   │   │ Disease Map + Risk Zones │  │ Sample Tracking      │
└──────┬──────┘   └──────────┬───────────────┘  └─────────┬───────────┘
       │                     │                            │
       └──────────┬──────────┴──────────────┬─────────────┘
                  ▼                         │
            ┌─────────────┐                │
            │  BROWSER    │                │
            │ (React App) │                │
            └──────┬──────┘                │
                   ▼                       │
            ┌─────────────┐                │
            │  Nginx :80  │◄───────────────┘
            └──────┬──────┘
                   ▼
            ┌─────────────┐     /api/     ┌──────────────┐
            │ Spring Boot  │────────────► │  PostgreSQL   │
            │  Backend:8080│              │  + PostGIS    │
            └──────┬──────┘              └──────────────┘
                   │ HTTP
                   ▼
            ┌─────────────┐
            │ Python AI    │  Risk Engine + Cluster Detection
            │ FastAPI:5000 │
            └─────────────┘
```

---

*Documentation by Team ANI · PashuRaksha · Smart India Hackathon 2026*

# 05 — Project Folder Structure (Annotated)

Complete map of what lives where and why.

```
SIH2026/
│
├── docs/                          # 📚 THIS re-analysis (read these first)
│   ├── 01_PROBLEM_AND_VISION.md   # What problem, who uses it, why we win
│   ├── 02_WHAT_IS_BUILT.md        # Current state (92% done, verified)
│   ├── 03_WHAT_NEEDS_BUILDING.md  # Phase 5 remaining work
│   ├── 04_HOW_MASS_ADOPTION_WORKS.md  # Scale + accessibility strategy
│   └── 05_FOLDER_STRUCTURE.md     # This file
│
├── ai-service/                    # 🧠 PYTHON AI SERVICE (:5000)
│   ├── main.py                    # FastAPI app — 12 endpoints
│   ├── image_detector.py          # CNN (MobileNetV2) disease detection
│   ├── chat_engine.py             # NLP symptom→disease (8 diseases, 8 langs)
│   ├── treatment_protocols.py     # Drug/dosage/cost/first-aid knowledge base
│   ├── outbreak_intelligence.py   # Area cases, vaccination gap, herd risk
│   ├── weather_service.py         # Open-Meteo + disease-weather correlation
│   ├── risk_engine.py             # 4-factor risk scoring
│   ├── cluster_detection.py       # Geographic outbreak clustering
│   ├── train_model.py             # CNN training script
│   ├── requirements.txt           # Python dependencies
│   ├── models/                    # Trained CNN (.pth) — gitignored
│   └── datasets/                  # Training images — gitignored (download from Kaggle)
│
├── backend/                       # ⚙️ SPRING BOOT BACKEND (:8080)
│   ├── src/main/java/com/pashuraksha/api/
│   │   ├── auth/                  # JWT login, registration
│   │   ├── cases/                 # Disease cases + AI scoring + auto-alerts
│   │   ├── animals/               # Animal registry
│   │   ├── farms/  farmers/       # Farm & farmer records
│   │   ├── alerts/                # Alert generation
│   │   ├── laboratories/          # Lab sample pipeline
│   │   ├── vaccinations/          # Vaccination records
│   │   ├── analytics/             # Dashboard, trends, disease-trends
│   │   ├── risk/                  # Risk zones, clustering
│   │   ├── weather/               # Weather proxy → AI service
│   │   ├── notifications/         # SMS simulation
│   │   ├── ai/                    # Proxy → Python AI (chat/image/fusion/complete)
│   │   ├── locations/             # Geographic reference
│   │   ├── security/              # JWT filter, provider
│   │   ├── seeder/                # Demo data auto-seed
│   │   └── config/                # Security + CORS config
│   ├── src/main/resources/application.properties
│   └── pom.xml                    # Maven dependencies
│
├── frontend/                      # 💻 REACT FRONTEND (:5173)
│   ├── src/
│   │   ├── main.tsx               # Entry point (providers, PWA)
│   │   ├── App.tsx                # Routing + floating chat mount
│   │   ├── api/client.ts          # Axios + JWT interceptor
│   │   ├── pages/                 # 13 pages (dashboard, cases, report, chat...)
│   │   ├── components/            # UI components
│   │   │   ├── AiFloatingChat.tsx # ⭐ Flagship — floating AI (voice/image/GPS)
│   │   │   ├── WeatherWidget.tsx  # Weather + disease risk
│   │   │   ├── OfflineIndicator.tsx  # PWA offline banner
│   │   │   ├── Layout.tsx  Sidebar.tsx  # Navigation
│   │   │   └── gov/               # Government dashboard components
│   │   ├── context/               # AuthContext, ThemeContext
│   │   ├── hooks/                 # useAuth, useCases, useFacilities, useMap
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # offlineSync (PWA report caching)
│   ├── tests/ai-chat.spec.ts      # Playwright browser tests (11 tests)
│   ├── playwright.config.ts       # Browser test config
│   ├── vite.config.ts             # Vite + PWA config
│   └── package.json
│
├── database/
│   └── init.sql                   # PostgreSQL schema + sample data (reference)
│
├── docker-compose.yml             # 🐳 Container orchestration
├── Dockerfile                     # All-in-one multi-stage build
├── nginx-all-in-one.conf          # Reverse proxy config
├── supervisord.conf               # Multi-service process manager
├── entrypoint.sh                  # Container startup script
│
├── .kiro/settings/permissions.yaml   # Kiro agent permissions
├── memory.md                      # Project state log
├── plan.md                        # Phase roadmap
├── goal.md                        # Success criteria
├── README.md                      # Project readme
└── Aniketh_Explain.md             # Original run guide
```

---

## Service Ports & Startup Order

| Order | Service | Port | Start command |
|-------|---------|------|--------------|
| 1 | PostgreSQL (Docker) | 5432 | `docker compose up -d` |
| 2 | AI Service | 5000 | `cd ai-service && .venv\Scripts\python -m uvicorn main:app --port 5000` |
| 3 | Backend | 8080 | `cd backend && java -jar target/pashuraksha-api-1.0.0-SNAPSHOT.jar` |
| 4 | Frontend | 5173 | `cd frontend && npm run dev` |

**Login:** `admin`/`admin123`, `farmer1`/`farmer123`, `vet1`/`vet123`, etc.

---

## Where Each Feature Lives (quick reference)

| Feature | Frontend | Backend | AI Service |
|---------|----------|---------|-----------|
| AI Chat (voice/text/image) | `AiFloatingChat.tsx` | `ai/ChatController` | `chat_engine.py`, `main.py` |
| Image disease detection | `AiFloatingChat`, `ReportDiseasePage` | `ai/DetectionController` | `image_detector.py` |
| Treatment protocols | `AiFloatingChat` cards | (proxied) | `treatment_protocols.py` |
| Outbreak intelligence | `AiFloatingChat` cards | (proxied) | `outbreak_intelligence.py` |
| Weather correlation | `WeatherWidget.tsx` | `weather/WeatherController` | `weather_service.py` |
| Disease reporting | `ReportDiseasePage.tsx` | `cases/CaseController` | (scoring via chat_engine) |
| Auto-alerts + SMS | (shown on dashboards) | `cases/CaseService`, `notifications/` | — |
| Analytics/trends | `AnalyticsPage.tsx` | `analytics/AnalyticsController` | — |
| GPS location | `AiFloatingChat`, `ReportDiseasePage` | (stored on case) | (used for area intel) |
| Offline support | `OfflineIndicator`, `utils/offlineSync` | — | — |
| 8-language voice | `AiFloatingChat` (Web Speech API) | — | (chat handles Hindi keywords) |

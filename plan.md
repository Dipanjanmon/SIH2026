# PLAN — PashuRaksha Remaining Work (Updated 28 Aug 2026)

## Completed

| Phase | Days Spent | Outcome |
|-------|-----------|---------|
| Phase 1 | 1 day | Merge conflicts fixed, clean compilation |
| Phase 2 | 1 day | AI Chat (100%), Image CNN (90%), Backend proxies, ChatPage UI |
| Phase 3 | 1 day | E2E integration, seeder, auto-alerts, serialization fixes |
| AI Core Fix | 0.5 day | Chat v2 rewrite, fusion endpoint, 100% chat accuracy |

**Current state:** 85% complete. Core AI works. All endpoints 200. Demo-able.

---

## What Remains: Phase 4 + Phase 5

### Phase 4 — PS Gap Closers (3-4 days)

These are features the Problem Statement explicitly asks for:

| Task | PS Requirement | Effort | Priority |
|------|---------------|--------|----------|
| 4.1 Weather/seasonal integration | "weather + historical disease trend data" | 4 hrs | 🔴 HIGH |
| 4.2 Historical trend API + charts | "historical disease trend data" | 3 hrs | 🔴 HIGH |
| 4.3 Offline PWA support | "offline channels" | 3 hrs | 🟡 MED |
| 4.4 SMS notification simulation | "SMS/IVR channels" | 2 hrs | 🟡 MED |
| 4.5 GovDashboard live data | Makes demo impressive | 3 hrs | 🟡 MED |
| 4.6 NADRS/INAPH integration mention | Shows govt system awareness | 1 hr | ⚪ LOW |

---

#### Task 4.1: Weather/Seasonal Integration

**Why:** PS says "weather + historical disease trend data"

**Implementation:**
- Python endpoint: `GET /api/v1/weather?district=Palghar`
- Fetch from Open-Meteo API (free, no key): temperature, humidity, rainfall
- Disease-weather correlation logic:
  - Monsoon (high humidity) → HS risk ↑
  - Hot + dry → FMD risk ↑ 
  - Rainy → LSD risk ↑ (vector breeding)
- Backend proxy: `GET /api/v1/weather/correlation?district=X`
- Frontend: Weather widget on GovDashboard + risk correlation card

**Open-Meteo API:** `https://api.open-meteo.com/v1/forecast?latitude=19.69&longitude=72.77&daily=temperature_2m_max,precipitation_sum,relative_humidity_2m_mean`

---

#### Task 4.2: Historical Trend Analysis

**Why:** Currently epi-curve is static/hardcoded

**Implementation:**
- Backend: `GET /api/v1/analytics/trends?days=30` → cases per day from DB
- Backend: `GET /api/v1/analytics/disease-trends` → breakdown by disease over time
- Frontend AnalyticsPage: Replace static charts with real API data
- Add: weekly trend line, disease distribution pie chart, district heatmap

---

#### Task 4.3: Offline PWA

**Why:** Rural Maharashtra has poor connectivity

**Implementation:**
- Add `vite-plugin-pwa` to frontend
- Service worker caches app shell
- Offline: farmer fills report → stored in localStorage → synced when online
- "Offline Mode" indicator in header

---

#### Task 4.4: SMS Notification Simulation

**Why:** PS says "multilingual advisories/alerts via SMS/IVR"

**Implementation:**
- Backend: `NotificationService.java` — logs notification records
- Entity: `Notification(id, type, recipient, message, sent_at, status)`
- On case creation / alert → create notification record
- Frontend: Notification history in admin panel
- Note in docs: "Production integrates with MSG91/Twilio for real SMS"

---

#### Task 4.5: GovDashboard Live Data

**Implementation:**
- Replace hardcoded KPI values with `GET /api/v1/analytics/dashboard`
- Overlay real case locations on India map from `GET /api/v1/cases`
- Alerts panel fetches from `GET /api/v1/alerts`

---

### Phase 5 — Polish & Demo (3-4 days)

| Task | Effort | Impact |
|------|--------|--------|
| 5.1 Hindi/Marathi UI labels | 4 hrs | PS "multilingual" checkbox |
| 5.2 Docker one-command deploy | 3 hrs | Demo day reliability |
| 5.3 Mobile responsive check | 2 hrs | Polish |
| 5.4 Error handling + loading states | 2 hrs | Polish |
| 5.5 Demo script + presentation | 2 hrs | Demo day |
| 5.6 README update with screenshots | 1 hr | Documentation |

---

## Recommended Approach for Phase 4

**Start a new Kiro agent session (spec/focused mode)** — good choice because:
- Phase 4 is mostly independent new features (weather, trends, PWA)
- Each task is self-contained
- Can be parallelized if needed
- Clean context window for focused implementation

**Before starting new session, what's committed:**
- All Phase 1-3 code + AI core fix on `MJ-branch`
- memory.md + plan.md updated
- All services tested and working

---

## Quick Reference: What to Build in Phase 4

```
ai-service/
├── weather_service.py     # NEW — Open-Meteo fetch + disease correlation

backend/src/.../
├── weather/WeatherController.java    # NEW
├── analytics/AnalyticsController.java  # UPDATE — add trends endpoint
├── notifications/NotificationService.java  # NEW
├── notifications/Notification.java   # NEW entity

frontend/src/
├── components/WeatherWidget.tsx   # NEW
├── pages/AnalyticsPage.tsx        # UPDATE — real charts
├── service-worker config (PWA)    # NEW
```

# GOAL — PashuRaksha Working Prototype (Aniketh Branch)

**Deadline:** 20 September 2026 (~23 days)  
**Current state:** ~70% complete  
**Blocker:** Merge conflicts prevent compilation. AI features (chat + image detection) not built.

---

## What's Already Demo-Ready

The Aniketh branch delivers most of the visible prototype:
- 6-role auth system with JWT
- Government dashboard with India disease map (hardcoded cluster nodes, but impressive visually)
- Farmer disease report form with photo upload + symptom multi-select
- Cases list, detail, assignment flow
- Lab sample pipeline (collect → transit → test → result)
- Vaccination tracking
- Analytics page (by disease, by district, coverage)
- Disease surveillance map (Leaflet)
- Risk zone dashboard
- Full PostgreSQL schema with realistic sample data
- Docker single-container deployment

---

## What's Still Missing (Priority Order)

### 🔴 CRITICAL — Demo will fail without these

| # | Feature | Why critical |
|---|---------|-------------|
| 1 | **Fix merge conflicts** | Code doesn't compile right now |
| 2 | **AI Chat Advisory** | The #1 differentiator judges look for. Farmer types symptoms → gets disease guidance |
| 3 | **Image Disease Detection** | Photo upload UI exists but nothing processes the image |
| 4 | **Backend → AI integration** | Backend's RiskService is standalone; never calls the Python AI service |

### 🟡 HIGH — Makes demo significantly stronger

| # | Feature | Notes |
|---|---------|-------|
| 5 | **Proper routing** (App.tsx) | Currently all routes → GovDashboard. Need per-role routing to farmer/vet/lab dashboards |
| 6 | **GovDashboard live data** | Cluster nodes on India map are hardcoded. Should fetch from /risk/clusters |
| 7 | **End-to-end flow** | Report → risk scored → cluster detected → alert fires → vet notified — needs wiring |
| 8 | **Fix package.json** | Resolve conflict, ensure @tanstack/react-query is included |

### 🟢 NICE TO HAVE — Polish for finals

| # | Feature |
|---|---------|
| 9 | Real-time alert notifications (WebSocket or polling) |
| 10 | Hindi/Marathi language toggle |
| 11 | PDF report export |
| 12 | SMS notification simulation |
| 13 | Mobile responsive polish |

---

## AI/ML — The Hero Features to Build

### A. AI Chat Advisory (NEW — does not exist yet)

**What judges want to see:** Farmer types "my cow has fever and blisters" → system returns probable disease, risk level, immediate actions.

**Endpoint:** `POST /api/v1/chat/advisory`

**Input:**
```json
{ "message": "meri gaay ko bukhar hai aur muh mein chhaale hain", "animal_type": "cattle" }
```

**Output:**
```json
{
  "response": "Based on symptoms (fever + oral blisters), this is likely Foot and Mouth Disease (FMD)...",
  "probable_disease": "Foot and Mouth Disease",
  "confidence": 0.85,
  "risk_level": "HIGH",
  "immediate_actions": ["Isolate animal", "Contact vet", "Don't move livestock"],
  "should_report": true
}
```

**Implementation:** Keyword extraction + disease knowledge matrix (rule-based). The Aniketh AI service already has `SYMPTOM_WEIGHTS` — extend it into a symptom→disease matcher.

### B. Image Disease Detection (NEW — does not exist yet)

**What judges want to see:** Farmer uploads photo → AI identifies disease from image.

**Endpoint:** `POST /api/v1/detect/image`

**Input:** multipart file upload  
**Output:**
```json
{
  "prediction": "Lumpy Skin Disease",
  "confidence": 0.82,
  "recommendations": ["Isolate", "Report immediately"]
}
```

**Implementation options:**
1. Pre-trained MobileNetV2 fine-tuned on livestock images (best)
2. Simulated classifier with confidence (fallback for demo)

### C. Backend ↔ AI Wiring (integration gap)

Currently the Java `RiskService` does its own basic risk scoring (critical*30 + high*20 + count*5). It should instead call the Python AI service at `/api/v1/risk/calculate` which has the proper 4-factor engine.

---

## Demo Day Flow (9 steps)

```
1. FARMER logs in (farmer1/farmer123) → sees Farmer Dashboard
2. FARMER clicks "Report Disease" → fills form, uploads photo
3. SYSTEM: AI scores risk → "HIGH", image detection → "FMD suspected (85%)"
4. SYSTEM: Cluster detection runs → new cluster formed in district
5. SYSTEM: Alert auto-generated → appears on Vet + Gov dashboards
6. VET logs in (vet1/vet123) → sees alert → claims case → dispatches lab sample
7. LAB TECH logs in (lab1/lab123) → processes sample → submits positive result
8. GOV OFFICIAL logs in (govt1/govt123) → sees India map with clusters, analytics
9. FARMER uses AI Chat → "my goat has fever and diarrhea" → gets PPR guidance
```

---

## Success Criteria

- [ ] All merge conflicts resolved, project compiles and runs
- [ ] All 6 roles can login and see their respective dashboards
- [ ] Farmer can file a disease report with photo
- [ ] AI chat returns meaningful disease advisory
- [ ] Image detection returns a disease classification
- [ ] Risk score calculated via Python AI service (not Java fallback)
- [ ] Cluster detection produces visible clusters on gov dashboard
- [ ] Alerts appear on vet/gov dashboards when high-risk case reported
- [ ] Full system runs via `docker compose up` — one command
- [ ] Demo flow completes in <60 seconds end-to-end

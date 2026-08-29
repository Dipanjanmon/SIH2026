# PashuRaksha 🐄🏥

**SIH 2026 Prototype** · **Problem Statement:** SIH26128
**Intelligent Livestock Disease Surveillance & Early-Warning Web Platform**
For the Department of Animal Husbandry & Dairying (AHD), Govt. of India.

---

## 📖 What it does

PashuRaksha turns every farmer's phone into a disease-surveillance sensor. A farmer
describes symptoms (by voice, in their own language) or uploads a photo of a sick
animal. The system:

1. **Identifies the disease** — a CNN image classifier (MobileNetV2, ~90% val accuracy)
   and a rule-based symptom engine, fused for a single confident diagnosis.
2. **Gives an actionable plan** — first aid, drugs & dosage, recovery timeline, cost.
3. **Adds outbreak intelligence** — nearby cases, vaccination coverage, weather risk,
   herd-risk assessment for the farmer's own animals.
4. **Explains it naturally** — an optional Gemini Flash LLM rephrases the rule-based
   facts into warm, plain language in the farmer's tongue (falls back to structured
   text if no key / offline).
5. **Feeds government surveillance** — reports flow into a DBSCAN spatial-clustering
   engine that flags emerging outbreak clusters and auto-alerts block veterinary officers.

This is **surveillance and epidemic-prevention infrastructure**, not a vet-consultation
app — the value is the early-warning network built from farmer reports.

---

## 🏗️ Architecture

Four services, wired front-to-back:

```
Browser ──▶ Frontend (nginx :80) ──/api/v1──▶ Backend (Spring :8080) ──▶ AI service (FastAPI :5000)
                                                      │                          │
                                                      └──▶ PostgreSQL+PostGIS :5432 (CNN + LLM + DBSCAN)
```

* **Frontend:** React 18, Vite, Tailwind, Lucide, React-Leaflet, Recharts. PWA + offline sync.
  9-language voice (Web Speech STT/TTS), one-tap GPS capture, floating AI chat.
* **Backend:** Java 21, Spring Boot 3, Spring Security (JWT). Proxies AI endpoints,
  owns cases/alerts/vaccinations, seeds demo data on first run.
* **AI service:** Python, FastAPI. CNN image detector (PyTorch), rule-based symptom
  engine, treatment protocols, outbreak intelligence, DBSCAN clustering, Gemini Flash LLM
  (multi-key failover, optional).
* **Database:** PostgreSQL 16 + PostGIS.

---

## 🚀 One-command deploy (recommended)

```bash
docker compose up --build
```

That builds and starts all four services in the right order (DB → AI → backend → frontend),
with health checks. Open **http://localhost**.

* Frontend: http://localhost (port 80)
* Backend API: http://localhost:8080
* AI service: http://localhost:5000 (health at `/health`)

First build takes a few minutes (PyTorch CPU wheels, Maven deps, npm build).

### Optional: enable the LLM

The system runs fully without any API key (rule-based responses). To turn on natural-language
Gemini Flash responses, set keys before `docker compose up` (multi-key failover supported):

```bash
# PowerShell
$env:GEMINI_API_KEY="your-key"; docker compose up --build
```

Get free keys at https://aistudio.google.com/apikey. See `ai-service/.env.example`.

---

## 🛠️ Local development (without Docker)

Prerequisites: Java 21 + Maven, Python 3.10+, Node 20+, a PostGIS database.

```bash
# 1. Database (PostGIS on :5432, user admin / pass password / db pashuraksha)
docker run -d --name pashuraksha_db -p 5432:5432 \
  -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -e POSTGRES_DB=pashuraksha \
  postgis/postgis:16-3.4

# 2. AI service (:5000)
cd ai-service
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
# torch/torchvision are needed for the image detector — install separately if not present
python -m uvicorn main:app --host 0.0.0.0 --port 5000

# 3. Backend (:8080)
cd backend
./mvnw spring-boot:run
#   or: java -jar target/pashuraksha-api-1.0.0-SNAPSHOT.jar \
#         --spring.datasource.url=jdbc:postgresql://localhost:5432/pashuraksha \
#         --spring.datasource.username=admin --spring.datasource.password=password

# 4. Frontend (:5173)
cd frontend
npm install && npm run dev
```

The backend seeds demo users/farms/cases automatically on first run.

---

## 🧪 Demo credentials (seeded)

Login uses **username** (not email). All accounts below are auto-seeded.

| Role              | Username  | Password    |
| ----------------- | --------- | ----------- |
| Admin             | `admin`   | `admin123`  |
| Government Officer| `govt1`   | `govt123`   |
| Veterinarian      | `vet1`    | `vet123`    |
| Field Officer     | `field1`  | `field123`  |
| Farmer            | `farmer1` | `farmer123` |
| Lab Technician    | `lab1`    | `lab123`    |

---

## 🎬 Demo script (9 steps)

A tight walkthrough that shows the full loop. Run `docker compose up --build`, open
http://localhost, then:

1. **Log in as `farmer1` / `farmer123`.** Land on the surveillance dashboard.
2. **Open the floating AI chat** (bottom-right button). Pick a language from the header
   selector (e.g. Hindi) — the UI and voice switch language.
3. **Speak or type a symptom** — e.g. "cow has fever, blisters in mouth, drooling."
   Use the mic button for voice-to-text.
4. **Tap "Capture Location"** — one-tap GPS grabs coordinates (no typing).
5. **See the diagnosis:** Foot and Mouth Disease with a confidence score and risk badge.
   If an LLM key is set, the reply leads with a natural-language summary in the chosen language.
6. **Expand the cards:** First Aid & Treatment (drugs + dosage), Severity Timeline,
   Area Intelligence (nearby cases, vaccination coverage, weather risk, herd risk).
7. **Upload a photo instead** — the CNN classifies the image and fuses it with symptoms
   for a combined, higher-confidence diagnosis.
8. **Tap "File Disease Report"** — the case enters the system, triggering risk scoring
   and (if a cluster forms) an automatic alert.
9. **Log in as `govt1` / `govt123`** — view the case on the GIS map, watch the
   epidemiological curve, and see the outbreak cluster + alert that the report generated.

**Read-aloud:** any AI response can be played back with the "Read Aloud 🔊" button
(text-to-speech in the selected language) — built for low-literacy farmers.

---

## ✅ Verify it's running

```bash
curl http://localhost:5000/health          # AI service + LLM status
curl http://localhost:8080/api/v1/...       # backend (JWT-protected)
# Full chain (login → diagnosis) is exercised by the demo script above.
```

---

## 📚 Deeper docs

See the `docs/` folder:
* `01_PROBLEM_AND_VISION.md` — the problem and why this approach
* `02_WHAT_IS_BUILT.md` — current capabilities
* `03_WHAT_NEEDS_BUILDING.md` — roadmap
* `04_HOW_MASS_ADOPTION_WORKS.md` — go-to-market for scale
* `05_FOLDER_STRUCTURE.md` — repository layout

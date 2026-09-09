# PashuSahaya AI — Tech & Usage Docs

> All information about what the PashuSahaya AI medical module uses, how it works,
> how to run it, and what each file/package does.

The backend is **now ONE combined server** (FastAPI replaced by the Flask SmartBot
server on port 5000) that powers the **full-doctor AI Help Desk**: real species
detection + your trained disease models + Bengali vet-doctor chat (Gemini) + voice.

---

## 1. What this module does

### A. Photo analysis (upload an animal photo → AI reply cards)
1. **Species detection** (SpeciesNet name + confidence % + top-5 candidates)
2. **Main suspected problem** (highest-severity condition + signs to check)
3. **AI disease detection** — your trained MobilenetV2 models (overrides KB guess
   when confident): FMD / Lumpy Skin / Mastitis / Newcastle / Coccidiosis / Salmonella
4. **Upai / Remedy** (do-now steps, care tips, who to notify)
5. **Nearby veterinary hospital** (ranked by distance or state) + helpline 1962
6. Disclaimer

### B. Doctor chat (type any question in Bengali ⇒ text reply + 🔊 voice)
- Real AI veterinary doctor replies via Gemini (`gemini-2.0-flash`) with an animal-
  doctor system prompt; falls back to OpenRouter free model, then local KB.
- Persistent per-user session (history remembered) — recoverable via /vet/clear + recover.
- Voice read-out of every bot reply via TTS (`edge-tts`, Bengali/Hindi/English).

---

## 2. Architecture

```
AI Help Desk widget (Frontent\src\components\AIHelpDesk.jsx)
        |
        + - text question  -> POST /vet/chat   (Gemini Bengali doctor, session-remembered)
        + - 🔊 button       -> GET  /speak      (edge-tts audio)
        + - animal photo    -> POST /api/analyze (SpeciesNet + MobilenetV2 + KB + hospitals)
        |
        v
ONE Flask server (Ai\server.py, http://127.0.0.1:5000, CORS open)
        |
        +-- doctor chat: chat.py (Gemini) · sessions.py (JSON history) · config.py (keys/prompts)
        +-- photo: Analysis\analyzer.py -> SpeciesNet -> species group -> custom MobilenetV2
             -> vet_kb.json (conditions/upai) -> hospitals.json (nearby) 
        +-- voice: voice_engine.py (edge-tts, lang detect)
```

### API endpoints (port 5000)

| Method | Path                  | Purpose                                        |
|--------|-----------------------|------------------------------------------------|
| POST   | `/vet/chat`           | Bengali AI vet-doctor reply (q, uid, tone)     |
| GET    | `/vet/history`        | Session history (`?uid=`)                      |
| GET/POST | `/vet/clear`        | Delete session (recoverable)                   |
| POST   | `/api/analyze`        | Photo → species + problem + upai + hospitals + custom-model diagnosis |
| GET    | `/api/health`         | Engine + speciesnet ready + custom models      |
| GET    | `/api/hospitals`      | Nearby vet hospitals (`?lat=&lng=&state=&limit=`) |
| GET    | `/api/vet-kb`         | Raw vet knowledge base                         |
| GET/POST | `/chat`             | SmartBot generic Gemini chat (Bot)             |
| GET/POST | `/medical/chat`     | Human medical bot (the original medical assistant) |
| GET    | `/speak`              | TTS audio (`?q=&tone=&tl=`)                    |
| POST   | `/webhook`            | WhatsApp-style bot entry                       |
| GET    | `/health`             | Server alive                                   |

---

## 3. What was used (tech stack)

### Python packages (installed into Python 3.14, pip 26.x)
Installed from `Ai\requirements.txt` + extra installs.

| Package | Version (installed) | Used for |
|---------|---------------------|----------|
| `flask` | 3.1.x | REST API server (SmartBot + PashuSahaya endpoints, port 5000) |
| `google-generativeai` | 0.8.x | **Gemini doctor chat** (`gemini-2.0-flash`) for vet replies |
| `edge-tts` | 7.2.x | Neural TTS voice read-out (Bengali/Hindi/English/Urdu) |
| `fastapi` | 0.141.x | (legacy) earlier analyze server |
| `uvicorn` | 0.52.x | (legacy) earlier analyze server |
| `python-multipart` | 0.0.32 | File upload parsing (legacy + future) |
| `pillow` | 12.3.x | Image handling / transforms |
| `numpy` | 2.5.x | Tensor/numeric preprocessing |
| `torch` | 2.14.0+cpu | SpeciesNet + custom MobilenetV2 inference (CPU) |
| `torchvision` | 0.29.0+cpu | **MobilenetV2 architecture** for your disease models |
| `absl-py` | 2.5.x | SpeciesNet CLI logging |
| `kagglehub` | 1.0.x / 1.0.2 | Model weight download from Kaggle |
| `onnx2torch` | 1.5.x | ONNX→torch bridge used by SpeciesNet |
| `yolov5` | 7.0.11 | SpeciesNet object-detector dependency |
| `speciesnet` | 5.0.5 | **Google's pre-trained species classifier** |
| `huggingface_hub` | 1.30.x | Model hub access (SpeciesNet deps) |
| `cloudpathlib`, `pandas`, `matplotlib`, `scipy`, `sahi`, `roboflow` | — | SpeciesNet transitive deps |

> Notes:
> - torch/torchvision 2.14/0.29 upgraded from the matching `+cpu` build to
>   avoid the "operator torchvision::nms does not exist" mismatch.
> - OpenRouter is the **free fallback** when the Gemini key fails
>   (`qwen/qwen-2.5-72b-instruct`).
> - API keys live in `Ai\config.py` (Gemini + OpenRouter).

### Your trained disease models (auto-detected)
- `Analysis\cattle_disease_mobilenetv2.pth.zip` — **4 classes**:
  `foot_and_mouth, healthy, lumpy_skin, mastitis` — val-acc **90.6%**
- `Analysis\livestock_multi_mobilenetv2.pth.zip` — **10 classes**:
  cattle (fmd/healthy/lumpy/mastitis) + goat (healthy/unhealthy) +
  poultry (cocci/healthy/newcastle/salmonella) — val-acc **84.9%**
- Auto-discovered by `analyzer.discover_custom_models()` at every analysis;
  each is a torchvision **MobilenetV2** (224×224, ImageNet normalization) applied
  to the uploaded photo. A confident non-healthy prediction **overrides** the
  KB-only "problem" guess and also shows its own card + confidence.

### SpeciesNet model (real pre-trained AI)
- Model: `google/speciesnet/pyTorch/v4.0.3a/1` (Kaggle)
- What it is: EfficientNet-V2-M classifier trained by Google on **65M+ camera-trap
  images** covering **2000+ taxa** (species/genera/families) + a MegaDetector
  object-detection stage + geofencing ensemble.
- Weights downloaded once to `C:\Users\Aniketh\.cache\kagglehub\...`
  (~214 MB, auto-downloaded by `warmup.py` or first server start)
- Generates per-image: `prediction`, `prediction_score`, top-5 `classifications`,
  `detections`, `prediction_source`, `failures`.
- Runs on **CPU** in `single_thread` mode (RTX 3050 present but not CUDA-enabled).
- Typical inference: **2–9 s per photo** (~2.2 s with warm model).

### Location / hospital data
- `Ai\Analysis\hospitals.json` — 20+ veterinary hospitals / vet-college referral
  hospitals across Indian states (name, type, city, district, state, lat/lng,
  phone, serve-tags).
- Ranking: **haversine distance** when browser `lat/lng` sent; otherwise
  **same-state** facilities; otherwise a general fallback list.
- Frontend reverse-geocodes via **OpenStreetMap Nominatim** (free API) to convert
  browser geolocation to a state.

### Vet knowledge base
- `Ai\Analysis\vet_kb.json` — per species-group:
  - common conditions (name, signs, advice, severity high/medium/low)
  - care tips, red flags, helpline note, species alias lists
- Groups: **cattle · buffalo · goat/sheep · pig/swine · poultry/birds · dog ·
  cat · wildlife · fish/aquatic**.
- Each analysis picks the **highest-severity** condition as "main suspected
  problem"; "upai" combines its advice + care tips + notify rule + notifiable
  disease flag (FMD, LSD, ASF, H5N1, PPR, Anthrax, Brucellosis, HS, Rabies…).

### Frontend (React + Vite)
- `Frontent\src\components\AIHelpDesk.jsx` — the AI chat widget.
  - **Text question** → `doctorChat()` → POST `/vet/chat` (Gemini Bengali doctor,
    session-remembered; local KB only if the server is offline)
  - `analyzeImage()` → FormData POST to `/api/analyze`
  - `getGeo()` → browser geolocation + Nominatim → `lat/lng/state` fields
  - `formatAnalysis()` → species / problem / **custom disease models** / upai / hospital cards
  - `formatChatReply()` → renders the doctor's plain-text reply nicely
  - 🔊 **Shonun** button on every bot reply → `/speak` (edge-tts)
  - Quick chips (Outbreak / Vaccination / MVU / Helpline) — one line, also doctor-chatted
  - API base: `import.meta.env.VITE_AI_API_URL` or default `http://127.0.0.1:5000`
- Tailwind CSS (classes), `lucide-react` icons, `react-chartjs-2`, `leaflet` map.

---

## 4. File map

```
Ai\
  server.py                COMBINED Flask backend — SmartBot + PashuSahaya (port 5000)
  requirements.txt         Python deps
  start_server.bat         One-click backend launcher (port 5000)
  main.py                  SmartBot launcher (opens chat_voice demo)
  config.py                Gemini/OpenRouter keys + vet & medical system prompts
  chat.py                  Generic Gemini chat (SmartBot)
  voice_engine.py          edge-tts TTS + language detection
  sessions.py              JSON session persistence (vet:/medical:/smartbot)
  tone.json                Tone prompts (male/female) for generic chat
  medical_chat.html        Standalone human medical-bot demo
  Analysis\
    analyzer.py            MAIN engine (SpeciesNet → group → MobilenetV2 + KB + hospitals)
    vet_kb.json            Editable vet knowledge base
    hospitals.json         Vet hospital registry (india-wide)
    warmup.py              One-time SpeciesNet weight download + smoke test
    cattle_disease_mobilenetv2.pth.zip   YOUR cattle disease model (4 classes)
    livestock_multi_mobilenetv2.pth.zip  YOUR multi livestock model (10 classes)
    models\                Drop future fine-tuned weights here too
    data\                  Drop labeled images here (future fine-tuning)
  tmp\                     Upload temp / test scripts (cleaned on each upload)
```

---

## 5. How to run

### Backend (one-time)
```powershell
cd C:\Users\Aniketh\Desktop\SIH2026\Ai
python -m pip install -r requirements.txt     # if not already installed
python Analysis\warmup.py                     # downloads ~214MB SpeciesNet weights once
python server.py                              # serves http://127.0.0.1:5000
```
Or simply double-click **`start_server.bat`**.

### Frontend
```powershell
cd C:\Users\Aniketh\Desktop\SIH2026\Frontent
npm install        # if not installed
npm run dev        # opens dev server
```
Open the dashboard → AI Help Desk chip (bottom-right):
- type a question → **doctor reply (Bengali) + 🔊 voice**
- attach an animal photo → **species + disease detection + problem + upai + nearest hospital**
- quick chips: Active outbreak / Vaccination / MVU status / Helpline

### Testing the API without UI
```python
POST http://127.0.0.1:5000/api/analyze   # multipart "file"
POST http://127.0.0.1:5000/vet/chat      # {"q":"গরুর গায়ে দানা পড়েছে","uid":"test"}
curl http://127.0.0.1:5000/api/health
curl "http://127.0.0.1:5000/api/hospitals?lat=13.08&lng=77.5"
```

---

## 6. Your custom models (already loaded)

Your two trained MobilenetV2 checkpoints are inside `Analysis\` and are detected
automatically — you do **not** need to run anything:

| Checkpoint | Classes | Valid acc |
|-----------|---------|-----------|
| `cattle_disease_mobilenetv2.pth.zip` | foot_and_mouth, healthy, lumpy_skin, mastitis | 90.6% |
| `livestock_multi_mobilenetv2.pth.zip` | cattle(fmd/healthy/lumpy/mastitis), goat(healthy/unhealthy), poultry(cocci/healthy/newcastle/salmonella) | 84.9% |

To add another trained model:
1. Save it as a torch zip dict: `{"model_state_dict": <mobilenetv2 weights>, "class_names": [...], "img_size": 224}` with torch.save → `*.pth.zip`, and drop it in `Analysis\` or `Analysis\models\`.
2. Restart the server — `analyzer.predict_custom_models()` picks it up, shows its
   prediction card and boosts the "problem" selection when confident.

Species detection remains SpeciesNet; your custom models add the disease-diagnosis layer.

---

## 7. Known limits / disclaimers

- **Species detection is real AI (SpeciesNet) and disease detection is done by
  your trained MobilenetV2 models**; the vet-KB is an extra screening layer used
  for advice/upai/severity and when no confident model prediction exists.
- The AI vet-doctor chat needs **internet** (Gemini/OpenRouter). If both fail, the
  frontend falls back to a small local keyword KB (offline).
- Runs on CPU → few seconds per photo; GPU/CUDA torch build would speed it up.
- Hospital list is a curated static registry — wire the `hospitals` DB table in
  `database\init.sql` later for live data.
- **AI-assisted screening only — not a veterinary diagnosis.** Always confirm
  with a registered veterinary officer / helpline **1962**.
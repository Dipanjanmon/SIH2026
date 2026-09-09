# PashuSahaya AI — Analysis Engine

This folder is the **brain** of the PashuSahaya medical AI. Everything image
analysis happens here. The React frontend (AI Help Desk widget) talks to
`Ai\server.py`, which calls `Analysis\analyzer.py`.

## How a photo is analyzed (pipeline)

```
[User uploads animal photo in AI Help Desk widget]
        |
        v
  Ai\server.py  (FastAPI, POST /api/analyze)
        |
        v
  Analysis\analyzer.py  (analyze_image)
        |-- 1. SpeciesNet v4.0.3a (2000+ taxa pre-trained, CPU) -> species
        |-- 2. Map species -> care group  (cattle/buffalo/goat/pig/poultry/dog/cat/wildlife/fish)
        |-- 3. Vet KB lookup            (vet_kb.json) -> conditions + advice + severity
        |
        v
  JSON analysis -> rendered as an AI reply in the chat widget
```

## Files / folders

| Path            | Purpose                                                      |
|-----------------|--------------------------------------------------------------|
| `analyzer.py`   | Core engine: species detection + KB lookup + JSON assembly   |
| `vet_kb.json`   | Vet knowledge base — species groups, conditions, care tips.  |
| `warmup.py`     | One-time download of SpeciesNet weights (~214 MB) + test run  |
| `models\`       | **DROP fine-tuned weights here** (`.pt/.pth/.onnx/...`)      |
| `data\`         | **DROP labeled images / CSV labels here** (for training)     |
| `..\server.py`  | FastAPI backend serving this engine to the frontend          |

## Run the AI backend

From `Ai\`:

```
python -m pip install -r requirements.txt   # once
python Analysis\warmup.py                    # once: downloads speciesnet weights
python server.py                             # serves http://127.0.0.1:8000
```

Test it:

```
python -c "import sys; sys.path.insert(0,'.'); from Analysis.analyzer import analyze_image; print(analyze_image(__import__('pathlib').Path(r'...sample.jpg')))"
```

Or from the browser:
```
POST http://127.0.0.1:8000/api/analyze   (multipart field: file)
```

## Bringing in YOUR models (future fine-tuning)

1. Drop trained weights into `models\` (e.g. `condition_classifier.pt`).
2. Add a matching labels file `condition_classifier.labels.txt` (one label per line).
3. `analyzer.load_custom_models()` auto-discovers them and includes them in
   the `guidance.custom_models_loaded` section of every analysis.
4. Put training images + labels in `data\`.

Species detection stays on SpeciesNet; your custom model adds a
species-specific condition diagnosis layer.

## API reference

- `GET  /api/health` — engine status
- `POST /api/analyze` — full analysis (species + health)
- `POST /api/species-only` — quick species detection
- `GET  /api/vet-kb` — raw knowledge base (used for UI chips)

> Disclaimer: AI-assisted screening only — not a veterinary diagnosis.
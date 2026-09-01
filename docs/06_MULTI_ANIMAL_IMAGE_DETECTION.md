# Phase 6 Scope — Multi-Animal Image Disease Detection

## Goal
Extend the image CNN beyond cattle so a farmer can photograph a **goat, sheep, or
buffalo** and get a reliable disease prediction — not just cattle.

## Where we are today (verified)

- **Model:** `models/cattle_disease_mobilenetv2.pth` (8.7 MB), MobileNetV2, ~90% val accuracy.
- **Classes (cattle only):** `foot_and_mouth`, `healthy`, `lumpy_skin`, `mastitis`.
- **Trained by:** `train_model.py` on the "CowHealth-6K" dataset (RTX 3050, ~15-20 min).
- **Treatment side is already multi-species** — `treatment_protocols.py` already covers
  PPR (goat/sheep), Brucellosis, Anthrax, Hemorrhagic Septicemia, Black Quarter, etc.
  So once the model can *detect* these, the *treatment/intelligence* pipeline already works.
- **Rule-based symptom engine already handles all species** via text/voice. The gap is
  strictly the *image* path.

## The real work (this is an ML/data task, not just code)

Retraining a classifier is only as good as the labelled images we feed it. The honest
breakdown:

### 1. Data sourcing (the hard part, needs your decision)
We need labelled disease images per species. Realistic public sources:
- **Kaggle** — you already have a Kaggle API token set up. Candidate datasets:
  goat/sheep skin disease sets, PPR/ORF lesion images, buffalo LSD images. Coverage is
  uneven — cattle is well-covered, small ruminants much less so.
- **Roboflow Universe** — some annotated livestock-disease sets.
- **Gap risk:** for several small-ruminant diseases there simply aren't enough public
  images to hit ~90% accuracy. We must be honest per-class about how much data we found.

**Decision needed from you:** which species + diseases are the priority?
Suggested priority (by field prevalence + data availability):
1. **Goat/Sheep — PPR** (Peste des Petits Ruminants) — high impact, some data exists
2. **Goat — ORF / contagious ecthyma** (mouth scabs) — moderate data
3. **Buffalo — Lumpy Skin / FMD** — buffalo images can partly reuse cattle features
4. **Goat/Sheep — Healthy** baseline class per species

### 2. Two design options for the model

**Option A — One unified multi-class model (recommended).**
One MobileNetV2, classes become species-qualified, e.g.:
`cattle_fmd, cattle_lumpy, cattle_mastitis, cattle_healthy, goat_ppr, goat_orf,
goat_healthy, buffalo_lsd, buffalo_healthy ...`
- Pros: single file, one inference call, the model itself infers species+disease.
- Cons: needs balanced data across all classes or common classes dominate.

**Option B — Two-stage (species classifier → per-species disease model).**
First model says "goat vs cattle vs sheep vs buffalo", then routes to a species-specific
disease model.
- Pros: cleaner per-species accuracy, easier to add a species later.
- Cons: more files, two inferences, more moving parts (less "lazy").

**Recommendation:** Option A. Simpler, one artifact, and MobileNetV2 handles ~10-15
classes fine. Only move to B if a species' accuracy is unacceptable when mixed.

### 3. Implementation steps (once data + priorities are fixed)
1. Download + organize datasets into `datasets/organized_multi/{train,val}/{class}/`.
   Extend `organize_dataset()` with the new class_mapping.
2. Bump `CLASSES` / `NUM_CLASSES` in `train_model.py`; keep the same augmentation +
   fine-tuning approach (it already works well).
3. Add class-imbalance handling (weighted CrossEntropyLoss) — small-ruminant classes
   will have fewer images.
4. Train (RTX 3050, expect ~20-40 min for more classes/data).
5. Update `image_detector.py`:
   - `DISEASE_INFO` entries for the new classes (display name, description, recommendations).
   - The predict() output already returns `all_predictions`; add a `species` field parsed
     from the class name so the UI can show "Goat — PPR".
6. Frontend `AiFloatingChat.tsx`: remove the "cattle-only" caveat for supported species;
   optionally auto-set the animal-type dropdown from the model's detected species.
7. **One runnable check:** a small `verify_model.py` that loads the new model and asserts
   it predicts the correct class on 1-2 held-out images per species (fails loudly if a
   class regresses). No framework — a plain assert script.

### 4. Honest accuracy expectation
- Cattle classes: stay ~90% (unchanged data).
- Goat/sheep classes: **realistically 70-85%** initially, limited by public data volume.
  We will report real per-class val accuracy, not a single headline number, and the UI
  will keep the "confirm with a vet" caveat for low-confidence predictions.

## What I need from you to start
1. **Confirm the priority species + diseases** (or accept the suggested list above).
2. **Green-light data download** — I'll search Kaggle/Roboflow with your existing Kaggle
   token, report exactly what I find (counts per class), and we decide before training.
3. Confirm **Option A (unified model)** vs B.

Once you answer, the sequence is: source data → show you the real per-class counts →
train on your RTX 3050 → wire into detector + UI → runnable verify check → test end-to-end.

## Effort estimate
- Data sourcing + honest count report: ~1 session (depends heavily on what's available).
- Training + wiring + verification: ~1 session on the RTX 3050.
- **Biggest risk is data availability**, not code. If small-ruminant data is too thin,
  we ship the species we CAN do well and keep the honest caveat for the rest.

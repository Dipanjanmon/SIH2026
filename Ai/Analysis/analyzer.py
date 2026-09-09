"""PashuSahaya AI Analysis engine.

Pipeline:
  1. Input image (photo/dicom/path from the web layer).
  2. SpeciesNet (pre-trained, 2000+ taxa) detects species.
  3. Species is mapped to a care group (cattle/buffalo/goat/pig/poultry/dog/cat/wildlife/fish).
  4. Vet KB (vet_kb.json) returns per-group conditions, advice, severity, red flags.

Data drop-in contract:
  - Drop trained models/weights into Analysis\\models\\ and custom labels into
    Analysis\\data\\ and they will be auto-discovered here (see load_custom_models).
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from copy import deepcopy
from pathlib import Path
from typing import Any, Optional

SPECIESNET_MODEL = "kaggle:google/speciesnet/pyTorch/v4.0.3a/1"
BASE_DIR = Path(__file__).resolve().parent
VET_KB_PATH = BASE_DIR / "vet_kb.json"
HOSPITALS_PATH = BASE_DIR / "hospitals.json"
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

_model = None  # cached SpeciesNet instance


# --------------------------------------------------------------------------- #
# 1. Species detection
# --------------------------------------------------------------------------- #
def load_speciesnet() -> Optional[Any]:
    """Loads the SpeciesNet ensemble once (CPU). Returns None if unavailable."""
    global _model
    if _model is not None:
        return _model
    try:
        from speciesnet import SpeciesNet
        from speciesnet.utils import prepare_instances_dict  # noqa: F401

        t0 = time.time()
        _model = SpeciesNet(SPECIESNET_MODEL, geofence=True)
        # keep a module-level copy of prepare_instances_dict for reuse
        global _prepare_instances_dict
        _prepare_instances_dict = prepare_instances_dict
        print(f"[analyzer] SpeciesNet loaded in {time.time() - t0:.1f}s", flush=True)
        return _model
    except Exception as exc:  # pragma: no cover - env dependent
        print(f"[analyzer] SpeciesNet unavailable: {exc}", flush=True)
        return None


_prepare_instances_dict = None


def detect_species(image_path: Path) -> dict:
    """Runs SpeciesNet on one image. Returns prediction dict or failure info."""
    model = load_speciesnet()
    if model is None or _prepare_instances_dict is None:
        return {"species": "unknown", "score": None, "raw": None, "engine": "offline"}

    instances = _prepare_instances_dict(filepaths=[str(image_path)], country="IND")
    preds = model.predict(
        instances_dict=instances,
        run_mode="single_thread",
        batch_size=1,
        progress_bars=False,
    )

    entry = {}
    if preds:
        # SpeciesNet v4 returns {"predictions": [ {filepath, classification, detections,
        # prediction, prediction_score, ...}, ... ]}
        for item in preds.get("predictions", []):
            if isinstance(item, dict) and item.get("filepath") == str(image_path):
                entry = item
                break
    if not entry:
        # some builds return path-keyed dicts: {path: {...}}
        for k, v in preds.items() if preds else []:
            if isinstance(v, dict) and (k == str(image_path) or "prediction" in v):
                entry = v
                break
    failures = entry.get("failures", [])
    species = entry.get("prediction", "unknown")
    score = entry.get("prediction_score")
    return {
        "species": species,
        "score": round(score, 4) if score is not None else None,
        "predictions": entry.get("classifications"),
        "raw": entry,
        "engine": "speciesnet-v4.0.3a",
        "failures": failures,
    }


# --------------------------------------------------------------------------- #
# 2. Species -> care group mapping
# --------------------------------------------------------------------------- #
def load_vet_kb() -> dict:
    with open(VET_KB_PATH, encoding="utf-8") as fp:
        return json.load(fp)


def _common_name(taxon: str) -> str:
    """SpeciesNet labels look like 'uuid;class;order;family;genus;species;common name'.
    Returns the trailing human name (or the raw label when unparseable)."""
    if not taxon:
        return taxon
    parts = str(taxon).split(";")
    return parts[-1].strip() if parts else taxon


def map_species_to_group(species: str, kb: dict) -> Optional[str]:
    """Finds the vet KB group whose aliases match the SpeciesNet taxon.

    Primary signal is the human common name (last taxonomy segment) to avoid
    false positives like 'bos' matching 'proboscidea'. Matching uses word
    boundaries so 'elephant' never fires inside 'elephantidae' unless the alias
    itself is a token prefix (e.g. 'elephant' -> 'elephantidae' still matches).
    """

    def _tokens(text: str) -> set[str]:
        return {t.strip() for t in re.split(r"[;_\s']+", text) if len(t.strip()) >= 3}

    if not species:
        return None
    s = species.strip().lower()
    common = _common_name(s).lower()
    tokens = _tokens(s) | _tokens(common)

    candidates: list[tuple[int, str]] = []
    for group, cfg in kb.get("species_groups", {}).items():
        for alias in cfg.get("alias_taxa", []):
            if len(alias) < 3:
                continue
            alias = alias.lower()
            score = 0
            if alias == common:
                score = 1000 + len(alias)
            elif alias in common or common.startswith(alias):
                # common name contains the alias (or alias is a prefix of it),
                # e.g. alias 'elephant' inside common 'elephantidae family'
                score = 500 + len(alias)
            elif alias in tokens:
                # word-boundary hit against any taxonomy token
                score = 300 + len(alias)
            if score:
                candidates.append((score, group))

    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1]


# --------------------------------------------------------------------------- #
# 3. Nearby veterinary hospitals
# --------------------------------------------------------------------------- #
def load_hospitals() -> dict:
    with open(HOSPITALS_PATH, encoding="utf-8") as fp:
        return json.load(fp)


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Approximate great-circle distance in kilometers between two coords."""
    import math

    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.asin(math.sqrt(a))


def nearby_hospitals(
    *,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    state: Optional[str] = None,
    group: Optional[str] = None,
    limit: int = 3,
) -> list[dict]:
    """Returns veterinary hospitals for check-up, ranked:
    1) distance order when lat/lng are provided,
    2) otherwise same-state facilities,
    3) otherwise the general/referral defaults."""
    hospitals = load_hospitals()["hospitals"]
    limit = max(1, min(int(limit or 3), 10))

    scored: list[tuple[float, dict]] = []
    for h in hospitals:
        score = None
        if lat is not None and lng is not None:
            score = _haversine_km(lat, lng, h["lat"], h["lng"])
        elif state and h["state"].lower() == str(state).lower():
            score = 1_000_000 + len(scored)  # keep state matches ahead of everything
        elif not state:
            score = 2_000_000  # generic fallback list when no location at all

        # boost hospitals matching the animal group even if location matches
        if score is not None and group:
            if any(t in h.get("tags", []) for t in (group.lower(), "general", "all species")):
                score += 0  # location is the primary key; tag info surfaces in output
        if score is not None:
            scored.append((score, h))

    scored.sort(key=lambda x: x[0])
    out = []
    for _, h in scored[:limit]:
        out.append(
            {
                "name": h["name"],
                "type": h["type"],
                "city": h["city"],
                "district": h["district"],
                "state": h["state"],
                "phone": h.get("phone", load_hospitals()["helpline"]),
                "distance_km": round(_haversine_km(lat, lng, h["lat"], h["lng"]), 1)
                if lat is not None and lng is not None
                else None,
                "tags": h.get("tags", []),
            }
        )
    return out


# --------------------------------------------------------------------------- #
# 3. Custom model auto-discovery (Analysis\\ and Analysis\\models). User drops
#    fine-tuned MobilenetV2 checkpoints (*.pth.zip or .pt/.pth) and the engine
#    uses them for disease classification instead of KB-only guessing.
# --------------------------------------------------------------------------- #
CUSTOM_WEIGHT_EXTS = {".pt", ".pth", ".onnx", ".safetensors", ".bin"}
CUSTOM_ZIP_EXTS = {".zip"}  # torch.save(dict) archives like *_mobilenetv2.pth.zip

_custom_runtimes: dict[str, dict] = {}  # model_id -> loaded runtime


def discover_custom_models() -> list[dict]:
    """Finds trainable weight files in Analysis\\ and Analysis\\models.

    Prefers unpacked *.pt/*.pth over their *.pth.zip source so a fine-tuned
    MobileNetV2 that was delivered as `name.pth.zip` (and unpacked by us into
    `models/name.pth`) is only discovered once.
    """
    specs = []
    for folder in (BASE_DIR, MODELS_DIR):
        if not folder.exists():
            continue
        for weight in folder.iterdir():
            if not weight.is_file():
                continue
            ext = weight.suffix.lower()
            if ext in CUSTOM_WEIGHT_EXTS or (ext in CUSTOM_ZIP_EXTS and "mobilenetv2" in weight.name.lower()):
                specs.append({"path": str(weight), "name": weight.stem.replace(".pth", "") or weight.stem})
    # De-duplicate: if unpacked weight exists, drop the .pth.zip twin.
    names = {}
    for spec in specs:
        key = spec["name"]
        if key not in names:
            names[key] = spec
        else:
            # prefer a non-zip over a zip twin
            current = names[key]["path"]
            is_zip = lambda p: p.lower().endswith(".zip")
            if is_zip(current) and not is_zip(spec["path"]):
                names[key] = spec
    return list(names.values())


def load_custom_models() -> dict:
    """Returns {model_id: metadata} — used by /api/health and guidance output."""
    found: dict[str, dict] = {}
    for spec in discover_custom_models():
        runtime = _get_runtime(spec)
        if runtime is None:
            continue
        found[spec["name"]] = {
            "weight": spec["path"],
            "labels": runtime["labels"],
            "img_size": runtime["img_size"],
            "val_accuracy": runtime.get("val_accuracy"),
            "epoch": runtime.get("epoch"),
        }
    return found


def _get_runtime(spec: dict) -> Optional[dict]:
    """Loads (and caches) a torchvision MobilenetV2 checkpoint found on disk."""
    name = spec["name"]
    if name in _custom_runtimes:
        return _custom_runtimes[name]
    runtime = None
    try:
        import torch
        import torchvision.models as tv

        ckpt = torch.load(spec["path"], map_location="cpu", weights_only=False)
        if not isinstance(ckpt, dict) or "model_state_dict" not in ckpt:
            return None
        labels = ckpt.get("class_names") or []
        if not labels:
            return None
        img_size = int(ckpt.get("img_size", 224))

        model = tv.mobilenet_v2(weights=None)
        last_ch = getattr(model, "last_channel", 1280)
        # Support both heads: single Linear (legacy) and Sequential(Dropout, Linear,
        # ReLU, Linear) produced by retrain.py. Decide by inspecting the checkpoint.
        keys = ckpt.get("model_state_dict", {})
        if any(k.startswith("classifier.1.2.") for k in keys):
            model.classifier[1] = torch.nn.Sequential(
                torch.nn.Dropout(0.3),
                torch.nn.Linear(last_ch, 256),
                torch.nn.ReLU(inplace=True),
                torch.nn.Linear(256, len(labels)),
            )
        else:
            model.classifier[1] = torch.nn.Linear(last_ch, len(labels))
        model.load_state_dict(keys)
        model.eval()
        runtime = {
            "model": model,
            "labels": labels,
            "img_size": img_size,
            "val_accuracy": ckpt.get("val_accuracy"),
            "epoch": ckpt.get("epoch"),
        }
        _custom_runtimes[name] = runtime
        print(f"[analyzer] custom model '{name}' ready ({len(labels)} classes)", flush=True)
    except Exception as exc:
        print(f"[analyzer] custom model '{name}' failed to load: {exc}", flush=True)
    return runtime


def _predict_one(image_path: Path, spec: dict) -> Optional[dict]:
    """Runs a single discovered MobilenetV2 model on an image (CPU)."""
    from PIL import Image
    import torch
    from torchvision import transforms

    runtime = _get_runtime(spec)
    if runtime is None:
        return None
    try:
        img = Image.open(image_path).convert("RGB")
        img_size = runtime["img_size"]
        tf = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        with torch.no_grad():
            logits = runtime["model"](tf(img).unsqueeze(0))
            probs = torch.softmax(logits, dim=1)[0]
        top_probs, top_idx = torch.topk(probs, min(5, len(runtime["labels"])))
        classes = [
            {"label": runtime["labels"][int(i)], "confidence": round(float(p), 4)}
            for p, i in zip(top_probs, top_idx)
        ]
        return {
            "model": spec["name"],
            "img_size": img_size,
            "val_accuracy": runtime.get("val_accuracy"),
            "epoch": runtime.get("epoch"),
            "labels": runtime["labels"],
            "prediction": classes[0]["label"] if classes else None,
            "confidence": classes[0]["confidence"] if classes else None,
            "top": classes,
        }
    except Exception as exc:
        print(f"[analyzer] custom model '{spec['name']}' inference failed: {exc}", flush=True)
    return None


def predict_custom_models(image_path: Path) -> list[dict]:
    """Runs all discovered MobilenetV2 disease models on an image sequentially (CPU)."""
    out = []
    for spec in discover_custom_models():
        if _get_runtime(spec) is None:
            continue
        res = _predict_one(image_path, spec)
        if res:
            out.append(res)
    return out


def _normalize_disease_key(label: str) -> Optional[str]:
    """Maps a model class label to a canonical vet-KB disease word.

    e.g. 'cattle_fmd' -> 'foot_and_mouth', 'poultry_newcastle' -> 'newcastle',
    'healthy'/'*_healthy' -> None. Unmappable labels are returned as-is."""
    if not label:
        return None
    k = str(label).replace("-", "_").strip().lower()
    tokens = {t for t in k.split("_") if t}
    for token, canon in [
        ("fmd", "foot_and_mouth"),
        ("foot", "foot_and_mouth"),
        ("lumpy", "lumpy_skin"),
        ("mastitis", "mastitis"),
        ("cocci", "coccidiosis"),
        ("newcastle", "newcastle"),
        ("salmonella", "salmonella"),
    ]:
        if token in tokens:
            return canon
    if "healthy" in tokens:
        return None
    return k


def _kb_condition_for(group_cfg: dict, disease_key: Optional[str]) -> Optional[dict]:
    """Finds the vet-KB condition matching a canonical disease key."""
    if not disease_key:
        return None
    words = set(disease_key.replace("_", " ").split())
    for c in group_cfg.get("common_conditions", []):
        name = c["name"].lower()
        if any(w in name for w in words if len(w) > 3):
            return c
    return None


# --------------------------------------------------------------------------- #
# 4. Analysis assembly
# --------------------------------------------------------------------------- #
SEVERITY = {"low": 1, "medium": 2, "high": 3}

# Small in-memory result cache keyed by the file's SHA-256 so re-uploading the
# same photo returns instantly instead of re-running the 2s SpeciesNet pass.
_ANALYZE_CACHE: dict[str, dict] = {}
_ANALYZE_CACHE_MAX = 40


def _file_sha256(image_path: Path) -> str:
    h = hashlib.sha256()
    with open(image_path, "rb") as fp:
        for chunk in iter(lambda: fp.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def analyze_image(
    image_path: Path,
    *,
    state: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> dict:
    """Full analysis for a single image file. Returns a JSON-serializable dict."""
    digest = _file_sha256(image_path)
    cached = _ANALYZE_CACHE.get(digest)
    if cached is not None:
        _ANALYZE_CACHE.pop(digest, None)
        _ANALYZE_CACHE[digest] = cached
        return deepcopy(cached)

    kb = load_vet_kb()

    t0 = time.time()
    detection = detect_species(image_path)
    species = detection.get("species", "unknown")
    species_name = _common_name(species)
    group_key = map_species_to_group(species, kb)

    group_cfg = kb.get("species_groups", {}).get(group_key) if group_key else None
    if group_cfg is None:
        group_cfg = kb["species_groups"]["cattle"]  # sensible default for livestock portal

    custom_models_meta = load_custom_models()
    custom_preds = predict_custom_models(image_path) if custom_models_meta else []

    conditions = [
        {
            "name": c["name"],
            "signs": c["signs"],
            "advice": c["advice"],
            "severity": c["severity"],
        }
        for c in group_cfg["common_conditions"]
    ]

    # Main suspected problem = highest severity condition.
    if conditions:
        ranked = sorted(conditions, key=lambda c: SEVERITY.get(c["severity"], 0), reverse=True)
        problem = ranked[0]
        dynamic_advice = problem["advice"]
    else:
        problem = None
        dynamic_advice = "No specific condition matrix for this species; consult nearest vet."

    # Custom MobilenetV2 models take priority when they detect a disease.
    disease_conf = 0.0
    disease_key = None
    predicted_label = None
    if custom_preds:
        # pick the strongest confident non-healthy prediction across models
        best = max(
            (
                {"label": m["prediction"], "key": _normalize_disease_key(m["prediction"]),
                 "conf": m.get("confidence") or 0.0}
                for m in custom_preds
                if m.get("prediction") and _normalize_disease_key(m["prediction"])
            ),
            key=lambda x: x["conf"],
            default=None,
        )
        if best:
            disease_key = best["key"]
            predicted_label = best["label"]
            disease_conf = best["conf"]

    if disease_key:
        kb_match = _kb_condition_for(group_cfg, disease_key)
        if kb_match:
            problem = {
                "name": kb_match["name"],
                "signs": kb_match["signs"],
                "advice": kb_match["advice"],
                "severity": kb_match["severity"],
            }
            dynamic_advice = problem["advice"]
        elif disease_key in {"foot_and_mouth", "lumpy_skin", "mastitis", "newcastle", "coccidiosis", "salmonella"}:
            # mapped disease but species group's KB has no exact slot -> generic advice
            problem = problem or {"name": predicted_label.replace("_", " ").title(), "signs": "", "advice": "", "severity": "medium"}
            dynamic_advice = "Your image classifier flags a possible disease condition. Please show this animal to a registered veterinary officer soon."

    if problem and _has_redflag_hint(problem, group_cfg):
        dynamic_advice += " This is a notifiable/high-risk condition — take extra care."

    upai = {
        "immediate": dynamic_advice,
        "care_tips": group_cfg.get("care_tips", ""),
        "notify": group_cfg.get("helpline_note", ""),
        "helpline": kb.get("helpline", "1962"),
    }

    hospitals = nearby_hospitals(
        lat=lat,
        lng=lng,
        state=state,
        group=group_key,
        limit=3,
    )

    analysis = {
        "image": image_path.name,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "engine": detection.get("engine", "offline"),
        "processed_in_ms": round((time.time() - t0) * 1000, 1),
        "detection": {
            "species": species_name,
            "species_taxon": species,
            "score": detection.get("score"),
            "top5": detection.get("predictions"),
            "category": group_cfg.get("category", "Livestock"),
            "group": group_key,
        },
        "problem": (
            {
                "name": problem["name"],
                "signs": problem["signs"],
                "severity": problem["severity"],
            }
            if problem
            else None
        ),
        "upai": upai,
        "health": {
            "summary": (
                f"{group_cfg.get('label', species)} detected. "
                f"{len(group_cfg['common_conditions'])} possible conditions considered "
                f"for this species group."
            ),
            "conditions": conditions,
            "red_flags": group_cfg.get("red_flags", []),
        },
        "hospitals": {
            "helpline": kb.get("helpline", "1962"),
            "nearby": hospitals,
        },
        "guidance": {
            "care_tips": group_cfg.get("care_tips", ""),
            "helpline": group_cfg.get("helpline_note", ""),
            "custom_models_loaded": [
                {
                    "model": m_id,
                    "labels": meta["labels"],
                    "val_accuracy": meta.get("val_accuracy"),
                }
                for m_id, meta in custom_models_meta.items()
            ],
        },
        "custom_diagnosis": custom_preds,
        "disclaimer": kb.get("disclaimer", ""),
        "failures": detection.get("failures", []),
    }

    if detection.get("score") is not None and detection["score"] < 0.4:
        analysis["auth_warning"] = (
            "Low species confidence - the image may be blurry, cropped or contain "
            "multiple animals. Retake in good light or upload a clearer photo."
        )

    if len(_ANALYZE_CACHE) >= _ANALYZE_CACHE_MAX:
        _ANALYZE_CACHE.pop(next(iter(_ANALYZE_CACHE)))
    _ANALYZE_CACHE[digest] = analysis
    return analysis


def _has_redflag_hint(condition: dict, group_cfg: dict) -> bool:
    """Heuristic: does the top condition look notifiable/high-risk for this group?"""
    name = (condition.get("name") or "").lower()
    flags = (str(group_cfg.get("red_flags", "")) + " " + name).lower()
    for kw in ("fmd", "lsd", "african swine", "classical swine", "avian influenza",
               "h5n1", "newcastle", "ppr", "anthrax", "brucellosis", "haemorrhagic", "rabies"):
        if kw in flags:
            return True
    return False


# --------------------------------------------------------------------------- #
# Quick interactive test
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    import sys

    target = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Aniketh\Desktop\cameratrapai\test_data\african_elephants.jpg"
    res = analyze_image(Path(target))
    print(json.dumps(res, ensure_ascii=False, indent=2)[:3000])
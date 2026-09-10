"""One-time warmup: downloads SpeciesNet weights and runs a sample inference so the server
startup is fast later. Run:  python Analysis\warmup.py  (first run downloads ~1-2GB)"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from speciesnet import SpeciesNet
from speciesnet.utils import prepare_instances_dict

MODEL = "kaggle:google/speciesnet/pyTorch/v4.0.3a/1"
SAMPLE = r"C:\Users\Aniketh\Desktop\cameratrapai\test_data\african_elephants.jpg"


def main() -> None:
    t0 = time.time()
    print("[warmup] Loading SpeciesNet (first run downloads weights)...", flush=True)
    model = SpeciesNet(MODEL, components="all", geofence=False)
    print(f"[warmup] Model loaded in {time.time() - t0:.1f}s", flush=True)

    instances = prepare_instances_dict(filepaths=[SAMPLE], country="IND")
    preds = model.predict(
        instances_dict=instances,
        run_mode="single_thread",
        batch_size=1,
        progress_bars=False,
    )
    print("[warmup] Sample prediction:", flush=True)
    for item in (preds or {}).get("predictions", []):
        if isinstance(item, dict):
            for path, p in item.items():
                print(f"  {path} -> {p.get('prediction')} ({p.get('prediction_score')})", flush=True)
    print("[warmup] DONE", flush=True)


if __name__ == "__main__":
    main()
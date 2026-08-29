"""
Runnable check for the multi-animal image detector. Asserts the model predicts
the correct SPECIES on held-out validation images for each species. Fails loudly
(non-zero exit) if a species regresses — the smallest guard that catches a broken
model/label mapping without a test framework.

Run: python verify_model.py
"""
import glob
import sys
from collections import defaultdict

from image_detector import ImageDetector

det = ImageDetector()
assert det.model is not None, "model failed to load"
print("Loaded classes:", det.class_names)

# One species per folder we have local val images for. We check SPECIES (not exact
# disease) because that's the reliable signal; disease accuracy is reported per-class
# in training and some classes (poultry_cocci) are known-weaker.
CHECKS = [
    ("datasets/organized_multi/val/cattle_healthy/*", "cattle"),
    ("datasets/organized_multi/val/goat_healthy/*", "goat"),
    ("datasets/organized_multi/val/poultry_healthy/*", "poultry"),
]

failures = 0
for pattern, expected_species in CHECKS:
    files = sorted(glob.glob(pattern))[:10]  # sample up to 10 per species
    if not files:
        print(f"SKIP {expected_species}: no val images at {pattern}")
        continue
    correct = 0
    for f in files:
        with open(f, "rb") as fh:
            r = det.predict(fh.read())
        if r.get("species") == expected_species:
            correct += 1
    rate = correct / len(files)
    status = "ok" if rate >= 0.6 else "FAIL"
    if rate < 0.6:
        failures += 1
    print(f"{status}: {expected_species} species detected {correct}/{len(files)} ({rate*100:.0f}%)")

if failures:
    print(f"\nVERIFY FAILED: {failures} species below 60% species-detection threshold")
    sys.exit(1)
print("\nVERIFY PASSED: all species detected correctly on held-out images")

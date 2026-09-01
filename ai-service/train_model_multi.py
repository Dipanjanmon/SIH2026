"""
PashuRaksha — Train MULTI-ANIMAL MobileNetV2 disease classifier.

10 species-qualified classes across cattle, goat, poultry:
  cattle_fmd, cattle_healthy, cattle_lumpy, cattle_mastitis,
  goat_healthy, goat_unhealthy,
  poultry_cocci, poultry_salmonella, poultry_newcastle, poultry_healthy

Design (kept close to the proven train_model.py):
- MobileNetV2, ImageNet init, freeze early features, fine-tune the rest.
- Class-WEIGHTED CrossEntropyLoss because the data is imbalanced (mastitis ~170 and
  goat classes ~450 vs poultry/cattle in the thousands). Weights = inverse class
  frequency so small classes aren't ignored.
- Reuses the cattle split already in datasets/organized; builds goat + poultry splits.
Hardware: RTX 3050 6GB. Expected ~25-45 min.
"""

import shutil
import time
from pathlib import Path

from PIL import Image, ImageFile
# Tolerate slightly-truncated JPEGs at load time (belt-and-suspenders with the
# _valid_images() pre-filter) so a borderline file degrades instead of crashing.
ImageFile.LOAD_TRUNCATED_IMAGES = True
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

# --- Config ---
ORGANIZED = Path("datasets/organized_multi")
CATTLE_ORGANIZED = Path("datasets/organized")           # existing cattle train/val split
GOAT_RAW = Path("datasets/goat_raw")                    # healthy_goat/, unhealthy_goat/
POULTRY_TRAIN = Path("datasets/poultry_raw/Train")      # flat files named CLASS.N.jpg
MODEL_OUTPUT = Path("models/livestock_multi_mobilenetv2.pth")

CLASSES = [
    "cattle_fmd", "cattle_healthy", "cattle_lumpy", "cattle_mastitis",
    "goat_healthy", "goat_unhealthy",
    "poultry_cocci", "poultry_salmonella", "poultry_newcastle", "poultry_healthy",
]
NUM_CLASSES = len(CLASSES)
BATCH_SIZE = 32
EPOCHS = 15
LR = 0.001
IMG_SIZE = 224
VAL_SPLIT = 0.2
IMG_EXT = ('.jpg', '.jpeg', '.png', '.bmp', '.webp', '.gif')
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# cattle source (already split) -> unified class name
CATTLE_MAP = {
    "foot_and_mouth": "cattle_fmd",
    "healthy": "cattle_healthy",
    "lumpy_skin": "cattle_lumpy",
    "mastitis": "cattle_mastitis",
}
# goat raw folder -> unified class
GOAT_MAP = {
    "healthy_goat": "goat_healthy",
    "unhealthy_goat": "goat_unhealthy",
}
# poultry filename prefix (pcr* merged into base) -> unified class
POULTRY_MAP = {
    "cocci": "poultry_cocci", "pcrcocci": "poultry_cocci",
    "salmo": "poultry_salmonella", "pcrsalmo": "poultry_salmonella",
    "ncd": "poultry_newcastle", "pcrncd": "poultry_newcastle",
    "healthy": "poultry_healthy", "pcrhealthy": "poultry_healthy",
}


def safe_loader(path):
    """Module-level (picklable for Windows DataLoader workers). If a file is
    unreadable, return a black image instead of crashing the whole run."""
    try:
        with Image.open(path) as im:
            return im.convert("RGB")
    except Exception:
        return Image.new("RGB", (IMG_SIZE, IMG_SIZE), (0, 0, 0))


def _valid_images(paths):
    """Keep only files PIL can fully decode as RGB. Scraped datasets contain
    corrupt/animated/mislabeled files that crash the DataLoader mid-training —
    filter them ONCE here so training never hits a bad image."""
    good = []
    for p in paths:
        try:
            with Image.open(p) as im:
                im.convert("RGB").load()  # force full decode, not just header
            good.append(p)
        except Exception:
            pass  # drop unreadable image
    return good


def _copy_split(images, cls, train_dir, val_dir, tag):
    """Deterministic 80/20 split, copy into train/val class dirs."""
    images = _valid_images(images)
    split_idx = int(len(images) * (1 - VAL_SPLIT))
    for i, img in enumerate(images):
        dest = train_dir if i < split_idx else val_dir
        shutil.copy2(img, dest / cls / f"{cls}_{tag}_{i}{img.suffix.lower()}")


def organize(force=False):
    # Reuse an already-organized dataset unless force=True (organizing copies ~13k
    # images and is slow; the safe_loader handles any stray bad file at train time).
    if ORGANIZED.exists() and not force:
        print("Reusing existing datasets/organized_multi (delete it or pass force to rebuild).")
        return
    print("Organizing multi-animal dataset...")
    if ORGANIZED.exists():
        shutil.rmtree(ORGANIZED)
    train_dir, val_dir = ORGANIZED / "train", ORGANIZED / "val"
    for cls in CLASSES:
        (train_dir / cls).mkdir(parents=True, exist_ok=True)
        (val_dir / cls).mkdir(parents=True, exist_ok=True)

    # 1) Cattle — already split; just copy across preserving the split.
    for split, dest_root in (("train", train_dir), ("val", val_dir)):
        for src_cls, uni_cls in CATTLE_MAP.items():
            src = CATTLE_ORGANIZED / split / src_cls
            if not src.exists():
                print(f"  WARN cattle {src} missing"); continue
            imgs = _valid_images([f for f in src.iterdir() if f.suffix.lower() in IMG_EXT])
            for i, img in enumerate(imgs):
                shutil.copy2(img, dest_root / uni_cls / f"{uni_cls}_{i}{img.suffix.lower()}")

    # 2) Goat — flat folders, we split.
    for folder, uni_cls in GOAT_MAP.items():
        src = GOAT_RAW / folder
        if not src.exists():
            print(f"  WARN goat {src} missing"); continue
        imgs = sorted([f for f in src.iterdir() if f.suffix.lower() in IMG_EXT])
        _copy_split(imgs, uni_cls, train_dir, val_dir, "goat")

    # 3) Poultry — flat files named CLASS.N.jpg; group by prefix, merge pcr*, split.
    if POULTRY_TRAIN.exists():
        groups: dict[str, list[Path]] = {}
        for f in POULTRY_TRAIN.iterdir():
            if f.suffix.lower() not in IMG_EXT:
                continue
            prefix = f.name.split('.')[0].lower()
            uni = POULTRY_MAP.get(prefix)
            if uni:
                groups.setdefault(uni, []).append(f)
        for uni_cls, imgs in groups.items():
            imgs = sorted(imgs)
            _copy_split(imgs, uni_cls, train_dir, val_dir, "poultry")
    else:
        print(f"  WARN poultry {POULTRY_TRAIN} missing")

    print("\nFinal per-class counts:")
    for split in ("train", "val"):
        for cls in CLASSES:
            n = len(list((ORGANIZED / split / cls).iterdir()))
            print(f"  {split}/{cls}: {n}")


def get_loaders():
    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
        transforms.RandomCrop(IMG_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    # safe_loader is module-level so DataLoader workers can pickle it on Windows.
    train_ds = datasets.ImageFolder(ORGANIZED / "train", transform=train_tf, loader=safe_loader)
    val_ds = datasets.ImageFolder(ORGANIZED / "val", transform=val_tf, loader=safe_loader)
    # num_workers=0: single-process loading. Slightly slower but avoids all Windows
    # spawn/pickling issues; GPU is the bottleneck here, not data loading.
    train_ld = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0, pin_memory=True)
    val_ld = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)
    print(f"\nTrain {len(train_ds)} | Val {len(val_ds)} | classes {train_ds.classes}")
    return train_ld, val_ld, train_ds


def class_weights(train_ds):
    """Inverse-frequency weights so small classes (mastitis, goat) count more."""
    counts = [0] * NUM_CLASSES
    for _, label in train_ds.samples:
        counts[label] += 1
    total = sum(counts)
    weights = [total / (NUM_CLASSES * c) if c > 0 else 0.0 for c in counts]
    print("Class weights:", {train_ds.classes[i]: round(weights[i], 2) for i in range(NUM_CLASSES)})
    return torch.tensor(weights, dtype=torch.float).to(DEVICE)


def build_model():
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    for p in model.features[:14].parameters():
        p.requires_grad = False
    model.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(model.last_channel, NUM_CLASSES))
    return model.to(DEVICE)


def run_epoch(model, loader, criterion, optimizer=None):
    train = optimizer is not None
    model.train() if train else model.eval()
    loss_sum, correct, total = 0.0, 0, 0
    # per-class correct/total for honest reporting
    per_correct = [0] * NUM_CLASSES
    per_total = [0] * NUM_CLASSES
    ctx = torch.enable_grad() if train else torch.no_grad()
    with ctx:
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            if train:
                optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            if train:
                loss.backward()
                optimizer.step()
            loss_sum += loss.item() * images.size(0)
            _, pred = outputs.max(1)
            total += labels.size(0)
            correct += pred.eq(labels).sum().item()
            for lbl, pr in zip(labels.view(-1), pred.view(-1)):
                per_total[lbl.item()] += 1
                if lbl.item() == pr.item():
                    per_correct[lbl.item()] += 1
    acc = 100.0 * correct / total
    return loss_sum / total, acc, per_correct, per_total


def main():
    print(f"Device: {DEVICE}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    organize()
    train_ld, val_ld, train_ds = get_loaders()
    weights = class_weights(train_ds)

    model = build_model()
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    best_acc = 0.0
    print(f"\nTraining {EPOCHS} epochs...\n")
    t0 = time.time()
    for epoch in range(EPOCHS):
        tl, ta, _, _ = run_epoch(model, train_ld, criterion, optimizer)
        vl, va, pc, pt = run_epoch(model, val_ld, criterion)
        scheduler.step()
        print(f"Epoch {epoch+1:2d}/{EPOCHS} | train {ta:.1f}% | val {va:.1f}%")
        if va > best_acc:
            best_acc = va
            MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                'model_state_dict': model.state_dict(),
                'class_names': train_ds.classes,
                'class_to_idx': train_ds.class_to_idx,
                'val_accuracy': va,
                'epoch': epoch + 1,
                'img_size': IMG_SIZE,
            }, MODEL_OUTPUT)
            # honest per-class accuracy at best epoch
            print("  Per-class val accuracy:")
            for i, cls in enumerate(train_ds.classes):
                p = 100.0 * pc[i] / pt[i] if pt[i] else 0.0
                print(f"    {cls}: {p:.1f}% ({pc[i]}/{pt[i]})")

    print(f"\nDone in {(time.time()-t0)/60:.1f} min. Best val acc: {best_acc:.1f}%")
    print(f"Saved: {MODEL_OUTPUT}")


if __name__ == "__main__":
    main()

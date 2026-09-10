"""Fine-tune a MobileNetV2 livestock-disease classifier.

Produces an updated .pth checkpoint in the exact format the Analysis engine
(analyzer.py -> load_custom_models) consumes:

    {model_state_dict, class_names, class_to_idx, val_accuracy, epoch, img_size}

Usage (local CPU/GPU, or port to Colab/Kaggle by changing torch.device):

    python retrain.py --data path/to/dataset --name cattle_disease --epochs 20

Dataset layout (ImageFolder format):

    path/to/dataset/train/<class>/img.jpg
    path/to/dataset/valid/<class>/img.jpg

Optionally continue training from an existing checkpoint:
    --resume models/livestock_multi_mobilenetv2.pth
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

BASE = Path(__file__).resolve().parent
MODELS = BASE / "models"
MODELS.mkdir(exist_ok=True)

IMAGENET_STATS = ([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])


def parse_args():
    p = argparse.ArgumentParser(description="MobileNetV2 fine-tune for livestock disease")
    p.add_argument("--data", required=True, help="dataset root (train/ + valid/ subdirs)")
    p.add_argument("--name", default="cattle_disease_mobilenetv2", help="output checkpoint name")
    p.add_argument("--epochs", type=int, default=20)
    p.add_argument("--batch", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--img", type=int, default=224)
    p.add_argument("--resume", default=None, help="start from previous .pth")
    p.add_argument("--device", default="auto", help="auto/cuda/cpu")
    return p.parse_args()


def _device(sel: str):
    if sel == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return torch.device(sel)


def _transforms_train(img: int):
    return transforms.Compose([
        transforms.RandomResizedCrop(img, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(12),
        transforms.ColorJitter(0.15, 0.15, 0.15),
        transforms.ToTensor(),
        transforms.Normalize(*IMAGENET_STATS),
    ])


def _transforms_eval(img: int):
    return transforms.Compose([
        transforms.Resize((img, img)),
        transforms.ToTensor(),
        transforms.Normalize(*IMAGENET_STATS),
    ])


def build_model(num_classes: int, resume_path=None):
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Linear(256, num_classes),
    )
    state = {}
    if resume_path and os.path.exists(resume_path):
        ck = torch.load(resume_path, map_location="cpu", weights_only=False)
        state = ck.get("model_state_dict", {}) if isinstance(ck, dict) else {}
        if state and "classifier.1.2.bias" in state:
            # exact same head shape -> load all weights
            model.load_state_dict(state)
    return model, state


def train(args):
    dev = _device(args.device)
    print(f"[retrain] device={dev} img={args.img} epochs={args.epochs} lr={args.lr} batch={args.batch}")

    data_root = Path(args.data)
    train_root, valid_root = data_root / "train", data_root / "valid"
    if not train_root.is_dir() or not valid_root.is_dir():
        raise SystemExit(f"--data={args.data} e train/valid folder nai. ImageFolder format dite hobe.")

    tr_ds = datasets.ImageFolder(train_root, _transforms_train(args.img))
    va_ds = datasets.ImageFolder(valid_root, _transforms_eval(args.img))
    class_names = [tr_ds.classes[i] for i in sorted(tr_ds.class_to_idx, key=lambda c: tr_ds.class_to_idx[c])]
    print(f"[retrain] classes ({len(class_names)}): {class_names}")
    print(f"[retrain] train={len(tr_ds)} valid={len(va_ds)}")

    tr_loader = DataLoader(tr_ds, batch_size=args.batch, shuffle=True, num_workers=0)
    va_loader = DataLoader(va_ds, batch_size=args.batch, shuffle=False, num_workers=0)

    model, _ = build_model(len(class_names), args.resume)
    model.to(dev)
    criterion = nn.CrossEntropyLoss()
    # freeze early layers -> tune only classifier + later blocks (faster, less data)
    for name, param in model.features.named_parameters():
        if name.split(".")[0] != "17":  # tune last feature block only
            param.requires_grad = False
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, "max", patience=3, factor=0.5)

    best_acc, best_epoch = 0.0, -1
    for epoch in range(1, args.epochs + 1):
        model.train()
        running, correct = 0, 0
        t0 = time.time()
        for X, y in tr_loader:
            X, y = X.to(dev), y.to(dev)
            optimizer.zero_grad()
            out = model(X)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            running += X.size(0)
            correct += (out.argmax(1) == y).sum().item()
        train_acc = correct / running

        model.eval()
        va_correct, va_total = 0, 0
        with torch.no_grad():
            for X, y in va_loader:
                X, y = X.to(dev), y.to(dev)
                out = model(X)
                va_correct += (out.argmax(1) == y).sum().item()
                va_total += X.size(0)
        val_acc = va_correct / va_total * 100.0
        scheduler.step(val_acc)

        if val_acc > best_acc:
            best_acc, best_epoch = val_acc, epoch
        print(f"[retrain] epoch {epoch:2d}/{args.epochs}  train={train_acc:.3%}  valid={val_acc:.2f}%  ({time.time()-t0:.1f}s)")

    ckpt = {
        "model_state_dict": {k: v.to("cpu") for k, v in model.state_dict().items()},
        "class_names": class_names,
        "class_to_idx": {c: i for i, c in enumerate(class_names)},
        "val_accuracy": best_acc,
        "epoch": best_epoch,
        "img_size": args.img,
        "trained_at": datetime.datetime.now().isoformat(),
        "history": {"best_valid_acc": best_acc, "lr": args.lr, "epochs": args.epochs},
    }
    out = MODELS / f"{args.name}.pth"
    torch.save(ckpt, out)
    print(f"\n[OK] best valid acc = {best_acc:.2f}%  |  saved -> {out}")

    with open(BASE / "retrain_history.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "name": args.name, "acc": round(best_acc, 4), "epoch": best_epoch,
            "classes": class_names, "time": ckpt["trained_at"],
        }) + "\n")
    return out


if __name__ == "__main__":
    train(parse_args())
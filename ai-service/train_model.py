"""
PashuRaksha — Train MobileNetV2 for Cattle Disease Classification
Dataset: CowHealth-6K (4 classes: FMD, Lumpy, Healthy, Mastitis)
Hardware: RTX 3050 6GB
Expected time: ~15-20 minutes
"""

import os
import shutil
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from pathlib import Path
import time

# --- Config ---
DATASET_SRC = Path("datasets/cowhealth_6k/Cows datasets")
DATASET_ORGANIZED = Path("datasets/organized")
MODEL_OUTPUT = Path("models/cattle_disease_mobilenetv2.pth")
CLASSES = ["foot_and_mouth", "healthy", "lumpy_skin", "mastitis"]
NUM_CLASSES = 4
BATCH_SIZE = 32
EPOCHS = 15
LR = 0.001
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def organize_dataset():
    """Merge split folders into single class folders with train/val split."""
    print("Organizing dataset...")

    # Clean previous
    if DATASET_ORGANIZED.exists():
        shutil.rmtree(DATASET_ORGANIZED)

    train_dir = DATASET_ORGANIZED / "train"
    val_dir = DATASET_ORGANIZED / "val"

    # Mapping: source folder -> target class
    class_mapping = {
        "Foot-and-mouth": "foot_and_mouth",
        "Healthycows 1": "healthy",
        "Healthycows 2": "healthy",
        "Lumpycows-1": "lumpy_skin",
        "Lumpycows-2": "lumpy_skin",
    }

    # Mastitis has subfolder structure
    mastitis_src = DATASET_SRC / "Mastitis" / "mastitis"

    # Create class dirs
    for cls in CLASSES:
        (train_dir / cls).mkdir(parents=True, exist_ok=True)
        (val_dir / cls).mkdir(parents=True, exist_ok=True)

    # Copy and split (80/20)
    for src_folder, target_class in class_mapping.items():
        src_path = DATASET_SRC / src_folder
        if not src_path.exists():
            print(f"  WARNING: {src_path} not found, skipping")
            continue

        images = [f for f in src_path.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.bmp', '.webp')]
        split_idx = int(len(images) * 0.8)

        for i, img in enumerate(images):
            dest = train_dir if i < split_idx else val_dir
            shutil.copy2(img, dest / target_class / f"{target_class}_{src_folder}_{i}{img.suffix}")

        print(f"  {src_folder} -> {target_class}: {len(images)} images")

    # Mastitis
    if mastitis_src.exists():
        images = [f for f in mastitis_src.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.bmp', '.webp')]
        split_idx = int(len(images) * 0.8)
        for i, img in enumerate(images):
            dest = train_dir if i < split_idx else val_dir
            shutil.copy2(img, dest / "mastitis" / f"mastitis_{i}{img.suffix}")
        print(f"  Mastitis: {len(images)} images")

    # Print final counts
    print("\nDataset organized:")
    for split in ["train", "val"]:
        split_dir = DATASET_ORGANIZED / split
        for cls in CLASSES:
            count = len(list((split_dir / cls).iterdir()))
            print(f"  {split}/{cls}: {count}")


def get_data_loaders():
    """Create train and validation data loaders with augmentation."""
    train_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
        transforms.RandomCrop(IMG_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder(DATASET_ORGANIZED / "train", transform=train_transform)
    val_dataset = datasets.ImageFolder(DATASET_ORGANIZED / "val", transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

    print(f"\nTrain: {len(train_dataset)} images, Val: {len(val_dataset)} images")
    print(f"Classes: {train_dataset.classes}")
    print(f"Class->Idx: {train_dataset.class_to_idx}")

    return train_loader, val_loader, train_dataset.classes


def build_model():
    """MobileNetV2 with custom classifier head for 4 classes."""
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    # Freeze early layers, fine-tune later ones
    for param in model.features[:14].parameters():
        param.requires_grad = False

    # Replace classifier
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.last_channel, NUM_CLASSES),
    )

    return model.to(DEVICE)


def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return running_loss / total, 100.0 * correct / total


def validate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / total, 100.0 * correct / total


def main():
    print(f"Device: {DEVICE}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")

    # Step 1: Organize dataset
    organize_dataset()

    # Step 2: Data loaders
    train_loader, val_loader, class_names = get_data_loaders()

    # Step 3: Build model
    model = build_model()
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"\nModel: MobileNetV2 (trainable: {trainable:,} / {total_params:,} params)")

    # Step 4: Training
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    best_val_acc = 0.0
    print(f"\nTraining for {EPOCHS} epochs...\n")
    start_time = time.time()

    for epoch in range(EPOCHS):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer)
        val_loss, val_acc = validate(model, val_loader, criterion)
        scheduler.step()

        print(f"Epoch {epoch+1:2d}/{EPOCHS} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.1f}% | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.1f}% | "
              f"LR: {scheduler.get_last_lr()[0]:.6f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                'model_state_dict': model.state_dict(),
                'class_names': class_names,
                'class_to_idx': {name: i for i, name in enumerate(class_names)},
                'val_accuracy': val_acc,
                'epoch': epoch + 1,
                'img_size': IMG_SIZE,
            }, MODEL_OUTPUT)

    elapsed = time.time() - start_time
    print(f"\nTraining complete in {elapsed/60:.1f} minutes")
    print(f"Best validation accuracy: {best_val_acc:.1f}%")
    print(f"Model saved to: {MODEL_OUTPUT}")


if __name__ == "__main__":
    main()

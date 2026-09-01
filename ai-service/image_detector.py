"""
PashuRaksha Image Disease Detector
Real CNN classifier using fine-tuned MobileNetV2 trained on cattle disease images.
Classes: FMD, Healthy, Lumpy Skin Disease, Mastitis
Accuracy: ~90% on validation set
"""

import io
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from typing import Dict
from pathlib import Path

# Multi-animal 10-class model (cattle+goat+poultry). Falls back to the old
# 4-class cattle model if the multi model isn't present.
_MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = _MODELS_DIR / "livestock_multi_mobilenetv2.pth"
if not MODEL_PATH.exists():
    MODEL_PATH = _MODELS_DIR / "cattle_disease_mobilenetv2.pth"

DISEASE_INFO = {
    "foot_and_mouth": {
        "display_name": "Foot and Mouth Disease",
        "description": "Viral disease causing blisters on mouth, tongue, and hooves",
        "recommendations": [
            "Isolate animal immediately",
            "Contact veterinary authority",
            "Do not move livestock from premises",
            "Ring vaccination recommended"
        ]
    },
    "healthy": {
        "display_name": "Healthy",
        "description": "No visible signs of disease detected in the image",
        "recommendations": [
            "Continue routine health monitoring",
            "Maintain vaccination schedule",
            "Ensure proper nutrition and hygiene"
        ]
    },
    "lumpy_skin": {
        "display_name": "Lumpy Skin Disease",
        "description": "Viral disease causing firm, raised nodules on skin across body",
        "recommendations": [
            "Isolate from herd immediately",
            "Implement vector control (insect repellent)",
            "Report to veterinary authority",
            "Supportive treatment and care"
        ]
    },
    "mastitis": {
        "display_name": "Mastitis",
        "description": "Bacterial udder infection causing swelling and milk changes",
        "recommendations": [
            "Separate milking of affected quarter",
            "Antibiotic treatment (vet prescribed)",
            "Maintain strict milking hygiene",
            "Discard affected milk"
        ]
    },

    # --- Multi-animal (10-class) model keys: species_condition ---
    "cattle_fmd": {
        "display_name": "Foot and Mouth Disease", "species": "cattle",
        "description": "Viral disease causing blisters on mouth, tongue, and hooves",
        "recommendations": ["Isolate animal immediately", "Contact veterinary authority",
                            "Do not move livestock", "Ring vaccination recommended"],
    },
    "cattle_healthy": {
        "display_name": "Healthy", "species": "cattle",
        "description": "No visible signs of disease detected",
        "recommendations": ["Continue routine monitoring", "Maintain vaccination schedule"],
    },
    "cattle_lumpy": {
        "display_name": "Lumpy Skin Disease", "species": "cattle",
        "description": "Viral disease causing firm, raised nodules on skin",
        "recommendations": ["Isolate from herd", "Vector control (insect repellent)",
                            "Report to veterinary authority", "Supportive care"],
    },
    "cattle_mastitis": {
        "display_name": "Mastitis", "species": "cattle",
        "description": "Bacterial udder infection causing swelling and milk changes",
        "recommendations": ["Separate milking of affected quarter", "Vet-prescribed antibiotics",
                            "Strict milking hygiene", "Discard affected milk"],
    },
    "goat_healthy": {
        "display_name": "Healthy Goat", "species": "goat",
        "description": "No visible signs of disease detected",
        "recommendations": ["Continue routine monitoring", "Maintain vaccination (incl. PPR)"],
    },
    "goat_unhealthy": {
        "display_name": "Unhealthy Goat (signs of illness)", "species": "goat",
        "description": "Visible signs of ill health — describe symptoms for a specific diagnosis. PPR is the most common serious goat disease in India.",
        "recommendations": ["Isolate the animal", "Describe symptoms for specific diagnosis",
                            "Contact veterinarian", "Check for PPR (fever, nasal/eye discharge, diarrhea)"],
    },
    "poultry_cocci": {
        "display_name": "Coccidiosis (Poultry)", "species": "poultry",
        "description": "Intestinal parasitic disease; bloody droppings, weakness",
        "recommendations": ["Isolate affected birds", "Anticoccidial in water (vet advised)",
                            "Clean, dry litter", "Provide clean water"],
    },
    "poultry_salmonella": {
        "display_name": "Salmonellosis (Poultry)", "species": "poultry",
        "description": "Bacterial infection; white diarrhea, weakness. Zoonotic — handle hygienically",
        "recommendations": ["Isolate affected birds", "Vet-prescribed antibiotics",
                            "Disinfect housing", "Wash hands after handling"],
    },
    "poultry_newcastle": {
        "display_name": "Newcastle Disease (Poultry)", "species": "poultry",
        "description": "Highly contagious viral disease; twisted neck, paralysis, high mortality",
        "recommendations": ["Isolate/report — highly contagious", "Vaccination is key prevention",
                            "Contact veterinary authority", "Disinfect premises"],
    },
    "poultry_healthy": {
        "display_name": "Healthy Poultry", "species": "poultry",
        "description": "No visible signs of disease detected",
        "recommendations": ["Continue routine monitoring", "Maintain Newcastle vaccination"],
    },
}

# Image preprocessing — must match training transforms
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


class ImageDetector:
    def __init__(self):
        self.model = None
        self.class_names = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()

    def _load_model(self):
        if not MODEL_PATH.exists():
            print(f"WARNING: Model not found at {MODEL_PATH}. Using fallback mode.")
            return

        checkpoint = torch.load(MODEL_PATH, map_location=self.device, weights_only=False)
        self.class_names = checkpoint['class_names']

        # Rebuild model architecture
        model = models.mobilenet_v2(weights=None)
        model.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(model.last_channel, len(self.class_names)),
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(self.device)
        model.eval()
        self.model = model

        print(f"Model loaded: {MODEL_PATH.name} ({checkpoint.get('val_accuracy', 0):.1f}% accuracy)")
        print(f"Classes: {self.class_names}")
        print(f"Device: {self.device}")

    def predict(self, image_bytes: bytes) -> Dict:
        if self.model is None:
            return self._fallback_predict(image_bytes)

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            tensor = TRANSFORM(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(tensor)
                probabilities = torch.softmax(outputs, dim=1)[0]

            # Get all predictions sorted by confidence
            all_predictions = []
            for idx, (class_name, prob) in enumerate(zip(self.class_names, probabilities)):
                info = DISEASE_INFO.get(class_name, {})
                all_predictions.append({
                    "disease": info.get("display_name", class_name),
                    "confidence": round(prob.item(), 4),
                })

            all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

            # Top prediction
            top_idx = probabilities.argmax().item()
            top_class = self.class_names[top_idx]
            top_confidence = probabilities[top_idx].item()
            top_info = DISEASE_INFO.get(top_class, {})

            return {
                "prediction": top_info.get("display_name", top_class),
                "species": top_info.get("species", ""),
                "class_key": top_class,
                "confidence": round(top_confidence, 4),
                "description": top_info.get("description", ""),
                "all_predictions": all_predictions,
                "recommendations": top_info.get("recommendations", []),
                "model_version": "mobilenetv2-multi-v2" if len(self.class_names) > 4 else "mobilenetv2-v1",
                "note": "AI analysis based on trained CNN model. Confirm with veterinary examination."
            }

        except Exception as e:
            return {
                "prediction": "Analysis Failed",
                "confidence": 0.0,
                "description": f"Could not process image: {str(e)}",
                "all_predictions": [],
                "recommendations": ["Please upload a clear image of the animal", "Consult a veterinarian"],
                "model_version": "mobilenetv2-v1",
                "error": str(e)
            }

    def _fallback_predict(self, image_bytes: bytes):
        """Fallback when model file is missing."""
        import random
        rng = random.Random(len(image_bytes))
        classes = list(DISEASE_INFO.keys())
        idx = rng.randint(0, len(classes) - 1)
        top_class = classes[idx]
        info = DISEASE_INFO[top_class]

        return {
            "prediction": info["display_name"],
            "confidence": round(rng.uniform(0.6, 0.85), 2),
            "description": info["description"],
            "all_predictions": [{"disease": DISEASE_INFO[c]["display_name"], "confidence": round(rng.uniform(0.05, 0.3), 2)} for c in classes],
            "recommendations": info["recommendations"],
            "model_version": "fallback-v1",
            "note": "Model file not available. Using simulated prediction."
        }

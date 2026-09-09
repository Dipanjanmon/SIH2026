DROP your fine-tuned / custom model weights HERE.

Supported extensions: .pt  .pth  .onnx  .safetensors  .bin

For each model, add a matching labels file so the analyzer knows the classes:
    models\condition_classifier.pt
    models\condition_classifier.labels.txt      <- one label per line

The analyzer auto-discovers anything in this folder and reports it in
guidance.custom_models_loaded for every analysis.
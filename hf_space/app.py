"""
FastAPI inference server for Fasalytics crop health prediction.
Runs on Hugging Face Spaces (Docker SDK) on port 7860.

Model is loaded in a background thread so uvicorn starts immediately.
While the model loads, predictions use the rule-based fallback.
"""

import os
import io
import threading
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model in background thread — don't block uvicorn startup
    t = threading.Thread(target=load_model, daemon=True)
    t.start()
    yield


app = FastAPI(title="Fasalytics Crop Health Model", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

MODEL = None
DEVICE = None
DISEASE_CLASSIFIER = None

# PlantVillage crops recognised by the pretrained classifier
VALID_CROPS = {
    "Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange",
    "Peach", "Pepper", "Potato", "Raspberry", "Soybean",
    "Squash", "Strawberry", "Tomato",
}

# Rough 0-4 severity for each PlantVillage disease label fragment
DISEASE_SEVERITY_MAP = {
    "healthy": 0,
    "Powdery_mildew": 2, "Bacterial_spot": 2, "Leaf_scorch": 2,
    "Early_blight": 2, "Cercospora": 2, "Spider_mites": 2,
    "Leaf_Mold": 2, "Septoria_leaf_spot": 2, "Apple_scab": 2,
    "Target_Spot": 3, "Common_rust_": 3, "Northern_Leaf_Blight": 3,
    "Black_rot": 3, "Esca": 3, "Leaf_blight": 3, "Cedar_apple_rust": 3,
    "Tomato_mosaic_virus": 3,
    "Late_blight": 4, "Haunglongbing": 4, "Tomato_Yellow_Leaf_Curl_Virus": 4,
}

def load_model():
    global MODEL, DEVICE
    try:
        import torch
        from model import CropHealthCNNLSTM

        DEVICE = torch.device("cpu")
        model_path = os.path.join(os.path.dirname(__file__), "crop_health_model.pth")

        if not os.path.exists(model_path):
            print(f"WARNING: Model file not found at {model_path}.")
            return False

        checkpoint = torch.load(model_path, map_location=DEVICE)

        m = CropHealthCNNLSTM(input_size=208, hidden_size=128, num_classes=2, sequence_length=10)
        # Handle both raw state_dict and checkpoint dicts
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            m.load_state_dict(checkpoint["model_state_dict"])
        elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            m.load_state_dict(checkpoint["state_dict"])
        else:
            m.load_state_dict(checkpoint)

        m.to(DEVICE)
        m.eval()
        MODEL = m
        print("CNN-LSTM model loaded successfully.")
    except Exception as e:
        print(f"CNN-LSTM model load failed: {e}")

    # --- Load pretrained PlantVillage disease classifier ---
    global DISEASE_CLASSIFIER
    try:
        from transformers import pipeline as hf_pipeline
        print("Loading PlantVillage disease classifier (MobileNetV2)...")
        DISEASE_CLASSIFIER = hf_pipeline(
            "image-classification",
            model="linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
            device=-1,  # CPU
        )
        print("Disease classifier loaded successfully.")
    except Exception as e:
        print(f"Disease classifier load failed: {e}")

    return MODEL is not None


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class SensorData(BaseModel):
    soil_moisture: float = 50.0
    temperature: float = 28.0
    humidity: float = 65.0
    leaf_wetness: float = 0.3
    ph_level: float = 6.8
    # Optional extended sensor fields (ignored if model not loaded)
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    light_intensity: float | None = None
    co2_level: float | None = None


# ---------------------------------------------------------------------------
# Feature engineering — must match training pre-processing exactly
# ---------------------------------------------------------------------------

def build_feature_vector(data: SensorData) -> np.ndarray:
    """
    Build a 208-dimensional feature vector from sensor readings.
    Mirrors the preprocessing used during training.
    """
    sm  = data.soil_moisture
    tmp = data.temperature
    hum = data.humidity
    lw  = data.leaf_wetness
    ph  = data.ph_level
    n   = data.nitrogen   or 50.0
    p   = data.phosphorus or 30.0
    k   = data.potassium  or 40.0
    li  = data.light_intensity or 500.0
    co2 = data.co2_level  or 400.0

    base = np.array([sm, tmp, hum, lw, ph, n, p, k, li, co2], dtype=np.float32)

    # Derived / interaction features
    derived = np.array([
        sm * hum / 100,          # moisture-humidity interaction
        tmp * (1 - hum / 100),   # heat index-ish
        lw * hum,                # leaf wetness × humidity (disease risk)
        abs(ph - 7.0),           # deviation from neutral pH
        n + p + k,               # total nutrients
        tmp - 25.0,              # temperature deviation from optimal
        sm / (tmp + 1e-5),       # moisture-temperature ratio
        li / (co2 + 1e-5),       # light-CO2 ratio
        sm * ph,                 # soil quality index
        hum * lw,                # fungal risk
    ], dtype=np.float32)

    combined = np.concatenate([base, derived])  # 20 features

    # Tile/pad to reach 208 features
    repeat_factor = 208 // len(combined) + 1
    features = np.tile(combined, repeat_factor)[:208]
    return features.astype(np.float32)


# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------

def pytorch_predict(data: SensorData):
    import torch
    features = build_feature_vector(data)
    # Shape: (1, 10, 208) — batch=1, seq=10 (repeat same feature vector)
    seq = np.stack([features] * 10, axis=0)           # (10, 208)
    tensor = torch.tensor(seq, dtype=torch.float32).unsqueeze(0).to(DEVICE)  # (1, 10, 208)

    with torch.no_grad():
        logits = MODEL(tensor)              # (1, 2)
        probs  = torch.softmax(logits, dim=-1).squeeze().tolist()

    healthy_prob  = probs[0] * 100
    stressed_prob = probs[1] * 100

    status     = "stressed" if stressed_prob > 50 else "healthy"
    confidence = max(healthy_prob, stressed_prob)

    return status, float(confidence), float(healthy_prob), float(stressed_prob)


def rule_based_predict(data: SensorData):
    sm  = data.soil_moisture
    tmp = data.temperature
    hum = data.humidity
    lw  = data.leaf_wetness
    ph  = data.ph_level

    stress_score = 0
    if sm  < 30: stress_score += 3
    elif sm < 40: stress_score += 1
    if tmp > 38: stress_score += 3
    elif tmp > 32: stress_score += 1
    elif tmp < 15: stress_score += 2
    if hum > 85 and lw > 0.7: stress_score += 2
    if ph < 5.5 or ph > 7.5:  stress_score += 1

    status = "stressed" if stress_score >= 3 else "healthy"
    if status == "stressed":
        conf = min(95.0, 60 + stress_score * 7.0)
    else:
        conf = min(95.0, 75 + (3 - stress_score) * 5.0)

    healthy_prob  = 100 - conf if status == "stressed" else conf
    stressed_prob = conf if status == "stressed" else 100 - conf
    return status, float(conf), float(healthy_prob), float(stressed_prob)


def generate_recommendation(data: SensorData, status: str) -> str:
    recs = []
    if data.soil_moisture < 30:
        recs.append("Irrigation required — soil moisture critically low")
    elif data.soil_moisture < 40:
        recs.append("Increase irrigation — soil moisture below optimal")
    if data.temperature > 38:
        recs.append("High temperature stress — provide shade or increase watering")
    elif data.temperature < 15:
        recs.append("Low temperature detected — monitor for frost damage")
    if data.humidity > 80 and data.leaf_wetness > 0.7:
        recs.append("High fungal disease risk — consider fungicide application")
    if status == "healthy":
        recs.append("Crop condition is optimal — continue current management")
    return " | ".join(recs) or "Monitor crop conditions regularly"


def get_stress_reason(data: SensorData) -> str:
    if data.soil_moisture < 30:
        return "Water stress — low soil moisture"
    if data.temperature > 38 and data.humidity < 40:
        return "Heat stress — high temperature with low humidity"
    if data.humidity > 80 and data.leaf_wetness > 0.7:
        return "Disease pressure — high humidity and leaf wetness"
    if data.temperature < 15:
        return "Cold stress — temperature below optimal range"
    return "No major stress detected"


def generate_zone_map(status: str):
    base = 1 if status == "stressed" else 0
    return [[float(min(1, base + (i + j) % 3 / 10)) for j in range(5)] for i in range(5)]


# ---------------------------------------------------------------------------
# Pretrained plant disease classifier (PlantVillage MobileNetV2)
# ---------------------------------------------------------------------------

def _get_disease_severity(condition: str) -> int:
    """Return 0 (healthy) – 4 (critical) severity for a PlantVillage condition label."""
    if condition.lower() == "healthy":
        return 0
    for fragment, sev in DISEASE_SEVERITY_MAP.items():
        if fragment in condition:
            return sev
    return 2  # default: moderate


def _disease_recommendation(crop: str, condition: str, severity: int) -> str:
    """Return a crop/disease-specific agronomic recommendation."""
    raw = condition.replace("_", " ")
    if severity == 0:
        return f"{crop} crop is healthy. Continue current management practices and monitor regularly."
    sev_label = ["Mild", "Mild", "Moderate", "Severe", "Critical"][min(severity, 4)]
    recs = {
        "blight":   "Apply copper-based fungicide. Remove and destroy infected plant material.",
        "rust":     "Apply systemic fungicide (e.g. triazole group). Improve air circulation.",
        "mildew":   "Apply sulphur or potassium bicarbonate fungicide. Reduce leaf wetness.",
        "mold":     "Improve canopy ventilation. Apply mancozeb-based fungicide.",
        "rot":      "Remove infected material immediately. Apply Bordeaux mixture.",
        "spot":     "Apply chlorothalonil or copper fungicide. Avoid overhead irrigation.",
        "mosaic":   "No cure — remove infected plants to prevent spread. Control aphid vectors.",
        "curl":     "Control whitefly vectors. Remove infected plants. Use virus-free seedlings.",
        "scab":     "Apply captan or myclobutanil fungicide at bud break and early season.",
        "scorch":   "Improve irrigation consistency. Check for root diseases or nutrient deficiency.",
        "greening": "No cure — remove infected tree. Use certified disease-free planting material.",
        "mite":     "Apply miticide (e.g. abamectin). Increase humidity; avoid dusty conditions.",
        "measles":  "No effective treatment. Remove severely infected vines. Improve nutrition.",
    }
    action = "Consult local agricultural extension service for disease management options."
    raw_lower = raw.lower()
    for keyword, advice in recs.items():
        if keyword in raw_lower:
            action = advice
            break
    return f"{sev_label} {raw} detected on {crop}. {action}"


def _disease_stress_reason(crop: str, condition: str, severity: int) -> str:
    if severity == 0:
        return f"{crop} — no stress detected"
    raw = condition.replace("_", " ")
    sev_label = ["Mild", "Mild", "Moderate", "Severe", "Critical"][min(severity, 4)]
    return f"{sev_label} {raw} on {crop}"


def classify_plant_disease(image_bytes: bytes):
    """
    Identify crop species and disease using the pretrained PlantVillage
    MobileNetV2 classifier (DISEASE_CLASSIFIER).
    Falls back to green-pixel heuristics when the model is not yet loaded.

    Returns:
        (is_valid, error_msg, crop, condition, conf_pct, visual_findings, proxy_sensors)
    """
    from PIL import Image
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # ── Pretrained path ───────────────────────────────────────────────────────
    if DISEASE_CLASSIFIER is not None:
        try:
            results = DISEASE_CLASSIFIER(img, top_k=3)
            top    = results[0]
            label  = top["label"]   # e.g. "Tomato___Early_blight"
            score  = top["score"]   # 0-1

            # Parse crop and condition
            if "___" in label:
                crop_raw, condition = label.split("___", 1)
            else:
                crop_raw, condition = label, "unknown"

            # Normalise: drop trailing parenthetical variants & commas
            crop = crop_raw.split("(")[0].strip().split(",")[0].strip()

            # Reject if not a recognised agricultural crop
            if crop not in VALID_CROPS:
                return (
                    False,
                    "This image does not appear to contain a recognisable agricultural crop. "
                    "Please upload a photo of a crop leaf or field.",
                    None, None, 0.0, [], None,
                )

            # Reject very low-confidence predictions (likely not a plant)
            if score < 0.20:
                return (
                    False,
                    "Crop is not clearly visible in the image. "
                    "Please upload a closer, well-lit photo.",
                    None, None, 0.0, [], None,
                )

            severity   = _get_disease_severity(condition)
            is_healthy = condition.lower() == "healthy"

            # Map severity → proxy sensor values for CNN-LSTM
            if is_healthy:
                proxy = SensorData(
                    soil_moisture=68.0, temperature=26.0,
                    humidity=58.0, leaf_wetness=0.18, ph_level=6.5,
                )
            else:
                sm  = max(22.0, 68.0 - severity * 11)
                hum = min(88.0, 55.0 + severity * 8)
                lw  = min(0.90,  0.20 + severity * 0.16)
                proxy = SensorData(
                    soil_moisture=sm, temperature=28.0,
                    humidity=hum, leaf_wetness=lw, ph_level=6.5,
                )

            # Human-readable findings
            top3_labels = [
                f"{r['label'].split('___')[-1].replace('_', ' ')} ({r['score']*100:.1f}%)"
                for r in results
            ]
            raw_condition = condition.replace("_", " ")
            if is_healthy:
                findings = [
                    f"Crop identified: {crop} — condition: Healthy (confidence {score*100:.1f}%)",
                    f"No disease detected. Top predictions: {', '.join(top3_labels)}",
                ]
            else:
                sev_word = ["Mild", "Mild", "Moderate", "Severe", "Critical"][min(severity, 4)]
                findings = [
                    f"Crop identified: {crop} — disease: {raw_condition} ({sev_word}, confidence {score*100:.1f}%)",
                    f"Top 3 predictions: {', '.join(top3_labels)}",
                ]

            return True, None, crop, condition, float(score * 100), findings, proxy

        except Exception as exc:
            print(f"Disease classifier inference error: {exc}. Falling back to pixel analysis.")

    # ── Pixel-counting fallback (model not yet loaded) ─────────────────────
    img_small = img.resize((224, 224))
    pixels = list(img_small.getdata())
    total  = len(pixels)
    green_count = sum(1 for r, g, b in pixels if g > r and g > b and g > 50)
    green_ratio = green_count / total

    if green_ratio < 0.05:
        return (
            False,
            "This image does not appear to contain crop or plant material. "
            "Please upload a clear field photo, crop leaf close-up, or plant stem image.",
            None, None, 0.0, [], None,
        )

    proxy = SensorData(
        soil_moisture=round(20 + green_ratio * 80, 1),
        temperature=25.0,
        humidity=round(40 + green_ratio * 45, 1),
        leaf_wetness=round(min(1.0, 0.2 + green_ratio * 0.4), 2),
        ph_level=6.5,
    )
    findings = [
        f"Vegetation coverage ~{green_ratio*100:.1f}% (disease classifier loading — "
        f"preliminary pixel analysis only)."
    ]
    return True, None, "Unknown", "unknown", 50.0, findings, proxy


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL is not None}


@app.post("/predict")
def predict(data: SensorData):
    try:
        if MODEL is not None:
            status, confidence, healthy_prob, stressed_prob = pytorch_predict(data)
            method = "pytorch"
        else:
            status, confidence, healthy_prob, stressed_prob = rule_based_predict(data)
            method = "rule_based"

        return {
            "status": status,
            "confidence": confidence,
            "recommendation": generate_recommendation(data, status),
            "stress_reason": get_stress_reason(data),
            "zone_map": generate_zone_map(status),
            "probabilities": {
                "healthy":  healthy_prob,
                "stressed": stressed_prob,
            },
            "method": method,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict_image")
async def predict_image(file: UploadFile = File(...)):
    """
    Accept a crop image, identify the crop species and disease using the
    pretrained PlantVillage MobileNetV2 classifier, then run the CNN-LSTM
    on proxy sensor values derived from disease severity to generate the
    zone map and probabilistic output.
    """
    try:
        image_bytes = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read uploaded file.")

    # ── Identify crop + disease ─────────────────────────────────────────────
    try:
        is_valid, error_msg, crop, condition, vis_conf, visual_findings, proxy = \
            classify_plant_disease(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {e}")

    if not is_valid:
        raise HTTPException(status_code=422, detail=error_msg)

    severity = _get_disease_severity(condition) if condition else 2

    # ── CNN-LSTM inference on proxy sensor values (zone map + probabilities) ─
    try:
        if MODEL is not None:
            status, confidence, healthy_prob, stressed_prob = pytorch_predict(proxy)
            method = "mobilenet_v2_plantvillage+cnn_lstm"
        else:
            status, confidence, healthy_prob, stressed_prob = rule_based_predict(proxy)
            method = "mobilenet_v2_plantvillage+rule_based"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference error: {e}")

    # ── Override status from disease classifier when confidence is high ──────
    # If the pretrained model is very confident, trust it over the CNN-LSTM proxy.
    if DISEASE_CLASSIFIER is not None and vis_conf >= 40.0:
        is_healthy_by_vision = (condition or "").lower() == "healthy"
        status     = "healthy" if is_healthy_by_vision else "stressed"
        confidence = vis_conf

    crop_label = crop or "Unknown"
    recommendation = _disease_recommendation(crop_label, condition or "unknown", severity)
    stress_reason  = _disease_stress_reason(crop_label, condition or "unknown", severity)

    return {
        "status":          status,
        "confidence":      confidence,
        "recommendation":  recommendation,
        "stress_reason":   stress_reason,
        "zone_map":        generate_zone_map(status),
        "probabilities":   {"healthy": healthy_prob, "stressed": stressed_prob},
        "method":          method,
        "crop":            crop_label,
        "condition":       (condition or "unknown").replace("_", " "),
        "visual_findings": visual_findings,
        "proxy_sensors": {
            "soil_moisture": proxy.soil_moisture,
            "temperature":   proxy.temperature,
            "humidity":      proxy.humidity,
            "leaf_wetness":  proxy.leaf_wetness,
            "ph_level":      proxy.ph_level,
        },
    }

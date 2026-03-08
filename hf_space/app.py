"""
FastAPI inference server for Fasalytics crop health prediction.
Runs on Hugging Face Spaces (Docker SDK) on port 7860.
"""

import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Fasalytics Crop Health Model", version="1.0.0")

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
        print("Model loaded successfully.")
        return True
    except Exception as e:
        print(f"Model load failed: {e}")
        return False


# Load on startup
load_model()


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

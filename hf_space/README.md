---
title: Fasalytics Crop Model
emoji: 🌱
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Fasalytics Crop Health Model

FastAPI inference server for the Fasalytics crop health prediction model.

## API

### POST /predict

```json
{
  "soil_moisture": 45.0,
  "temperature": 28.0,
  "humidity": 65.0,
  "leaf_wetness": 0.3,
  "ph_level": 6.8
}
```

**Response:**
```json
{
  "status": "healthy",
  "confidence": 85.0,
  "recommendation": "...",
  "stress_reason": "...",
  "zone_map": [[...]],
  "probabilities": {"healthy": 85.0, "stressed": 15.0}
}
```

### GET /health

Returns `{"status": "ok"}`.

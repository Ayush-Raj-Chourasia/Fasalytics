"""
Model inference logic for crop health prediction.

Tier 1: Hugging Face Space API (PyTorch model, full ML inference)
Tier 2: Rule-based fallback (works without PyTorch, always available)

Set HF_SPACE_URL env var to enable Tier 1.
Example: https://ayush-raj-chourasia-fasalytics-model.hf.space
"""

import os

# HF Space URL — set this in Azure App Settings after creating the HF Space
HF_SPACE_URL = os.environ.get("HF_SPACE_URL", "").rstrip("/")


class CropHealthPredictor:
    """Crop health predictor — calls HF Space API or falls back to rule-based logic."""

    def predict(self, sensor_data):
        """
        Make prediction for crop health.

        Args:
            sensor_data: dict with keys {
                'soil_moisture', 'temperature', 'humidity',
                'leaf_wetness', 'ph_level'
            }
        Returns:
            dict with status, confidence, recommendation, stress_reason, zone_map
        """
        # Tier 1: HF Space API (PyTorch model) — primary inference path
        if HF_SPACE_URL:
            result = self._predict_via_hf_api(sensor_data)
            if result:
                return result

        # Tier 2: Rule-based fallback (disabled — HF Space is live)
        # return self._predict_rule_based(sensor_data)
        raise RuntimeError("HF_SPACE_URL is not configured or unreachable. Set HF_SPACE_URL in Azure App Settings.")

    def _predict_via_hf_api(self, sensor_data):
        """Call the Hugging Face Space prediction API."""
        try:
            import requests
            response = requests.post(
                f"{HF_SPACE_URL}/predict",
                json=sensor_data,
                timeout=30,
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Warning: HF Space API unavailable ({e}), using rule-based fallback")
        return None

    def _predict_rule_based(self, sensor_data):
        """Rule-based prediction — no PyTorch needed."""
        soil_moisture = sensor_data.get("soil_moisture", 50)
        temperature   = sensor_data.get("temperature", 28)
        humidity      = sensor_data.get("humidity", 65)
        leaf_wetness  = sensor_data.get("leaf_wetness", 0.3)
        ph_level      = sensor_data.get("ph_level", 6.8)

        stress_score = 0
        if soil_moisture < 30:
            stress_score += 3
        elif soil_moisture < 40:
            stress_score += 1

        if temperature > 38:
            stress_score += 3
        elif temperature > 32:
            stress_score += 1
        elif temperature < 15:
            stress_score += 2

        if humidity > 85 and leaf_wetness > 0.7:
            stress_score += 2

        if ph_level < 5.5 or ph_level > 7.5:
            stress_score += 1

        status = "stressed" if stress_score >= 3 else "healthy"

        if status == "stressed":
            confidence = min(95.0, 60 + stress_score * 7.0)
        else:
            confidence = min(95.0, 75 + (3 - stress_score) * 5.0)

        recommendation = self._generate_recommendation(sensor_data, status)
        stress_reason  = self._get_stress_reason(sensor_data)
        zone_map       = self._generate_zone_map(sensor_data, status)

        return {
            "status": status,
            "confidence": float(confidence),
            "recommendation": recommendation,
            "stress_reason": stress_reason,
            "zone_map": zone_map,
            "probabilities": {
                "healthy":  float(100 - confidence) if status == "stressed" else float(confidence),
                "stressed": float(confidence) if status == "stressed" else float(100 - confidence),
            },
        }

    def _generate_recommendation(self, sensor_data, status):
        soil_moisture = sensor_data.get("soil_moisture", 50)
        temperature   = sensor_data.get("temperature", 28)
        humidity      = sensor_data.get("humidity", 65)
        leaf_wetness  = sensor_data.get("leaf_wetness", 0.3)

        recommendations = []

        if soil_moisture < 30:
            recommendations.append("Irrigation required - Soil moisture is critically low")
        elif soil_moisture < 40:
            recommendations.append("Increase irrigation - Soil moisture is below optimal")

        if temperature > 38:
            recommendations.append("High temperature stress - Provide shade or increase watering")
        elif temperature < 15:
            recommendations.append("Low temperature detected - Monitor for frost damage")

        if humidity > 80 and leaf_wetness > 0.7:
            recommendations.append("High fungal disease risk - Consider fungicide application")

        if status == "healthy":
            recommendations.append("Crop condition is optimal - Continue current management")

        return " | ".join(recommendations) if recommendations else "Monitor crop conditions regularly"

    def _get_stress_reason(self, sensor_data):
        soil_moisture = sensor_data.get("soil_moisture", 50)
        temperature   = sensor_data.get("temperature", 28)
        humidity      = sensor_data.get("humidity", 65)
        leaf_wetness  = sensor_data.get("leaf_wetness", 0.3)

        if soil_moisture < 30:
            return "Water stress - Low soil moisture"
        elif temperature > 38 and humidity < 40:
            return "Heat stress - High temperature with low humidity"
        elif humidity > 80 and leaf_wetness > 0.7:
            return "Disease pressure - High humidity and leaf wetness"
        elif temperature < 15:
            return "Cold stress - Temperature below optimal range"
        else:
            return "No major stress detected"

    def _generate_zone_map(self, sensor_data, status):
        base_stress = 1 if status == "stressed" else 0
        zone_values = []
        for i in range(5):
            row = []
            for j in range(5):
                variation = (i + j) % 3 / 10
                row.append(float(min(1, base_stress + variation)))
            zone_values.append(row)
        return zone_values


# Global singleton
_predictor = None


def get_predictor():
    """Get or create predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = CropHealthPredictor()
    return _predictor

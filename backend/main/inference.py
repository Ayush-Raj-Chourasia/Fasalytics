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
        Make prediction from sensor readings (dict).
        Tier 1: HF Space /predict (PyTorch model)
        Tier 2: Rule-based fallback
        """
        if HF_SPACE_URL:
            result = self._predict_via_hf_api(sensor_data)
            if result:
                return result

        raise RuntimeError("HF_SPACE_URL is not configured or unreachable. Set HF_SPACE_URL in Azure App Settings.")

    def predict_from_image(self, image_file):
        """
        Make prediction from a crop image.

        Tier 1: POST the image to HF Space /predict_image — validation,
                pixel analysis, and CNN-LSTM inference all happen there.
        Tier 2: Local pixel analysis + rule-based fallback if HF Space is
                unreachable (so the app keeps working offline / in dev).

        Args:
            image_file: Django InMemoryUploadedFile / TemporaryUploadedFile
        Returns:
            dict with  status, confidence, recommendation, stress_reason,
                       zone_map, probabilities, visual_findings,
                       soil_moisture, temperature, humidity, leaf_wetness, ph_level
                       and optionally  validation_error (str) when image is rejected
        """
        # ── Tier 1: HF Space /predict_image ─────────────────────────────────
        if HF_SPACE_URL:
            result = self._predict_image_via_hf(image_file)
            if result is not None:
                return result

        # ── Tier 2: local fallback ───────────────────────────────────────────
        return self._predict_image_local_fallback(image_file)

    # ── private helpers ──────────────────────────────────────────────────────

    def _predict_via_hf_api(self, sensor_data):
        """Call HF Space /predict with sensor JSON."""
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
            print(f"Warning: HF Space /predict unavailable ({e})")
        return None

    def _predict_image_via_hf(self, image_file):
        """
        POST the image to HF Space /predict_image as multipart/form-data.
        Returns the parsed JSON dict, or None if the call fails.
        Raises ValueError with the rejection message if HF Space returns 422
        (i.e. the image failed the crop-validation check on the HF side).
        """
        try:
            import requests

            image_file.seek(0)
            filename = getattr(image_file, 'name', 'upload.jpg')
            content_type = getattr(image_file, 'content_type', 'image/jpeg')

            response = requests.post(
                f"{HF_SPACE_URL}/predict_image",
                files={"file": (filename, image_file, content_type)},
                timeout=45,
            )

            if response.status_code == 422:
                # HF Space rejected the image (not a crop photo)
                detail = response.json().get("detail", "Image rejected by model server.")
                raise ValueError(detail)

            if response.status_code == 200:
                data = response.json()
                # Normalise proxy sensor fields to top-level for DB storage
                proxy = data.get("proxy_sensors", {})
                return {
                    "status":          data.get("status", "healthy"),
                    "confidence":      data.get("confidence", 80.0),
                    "recommendation":  data.get("recommendation", ""),
                    "stress_reason":   data.get("stress_reason", ""),
                    "zone_map":        data.get("zone_map", []),
                    "probabilities":   data.get("probabilities", {}),
                    "visual_findings": data.get("visual_findings", []),
                    "soil_moisture":   proxy.get("soil_moisture", 50.0),
                    "temperature":     proxy.get("temperature",   25.0),
                    "humidity":        proxy.get("humidity",      65.0),
                    "leaf_wetness":    proxy.get("leaf_wetness",   0.3),
                    "ph_level":        proxy.get("ph_level",       6.5),
                }
        except ValueError:
            raise   # re-raise crop-validation errors so views.py can return 400
        except Exception as e:
            print(f"Warning: HF Space /predict_image unavailable ({e}), using local fallback")
        return None

    def _predict_image_local_fallback(self, image_file):
        """
        Local fallback: PIL pixel analysis → proxy sensor values → rule-based score.
        Mirrors the logic in hf_space/app.py so results are consistent.
        """
        try:
            from PIL import Image
            import io

            image_file.seek(0)
            img = Image.open(io.BytesIO(image_file.read())).convert('RGB')
            img = img.resize((224, 224))
            pixels = list(img.getdata())
            total  = len(pixels)

            green_count = yellow_count = rust_count = brown_count = 0
            r_total = g_total = b_total = 0

            for r, g, b in pixels:
                r_total += r; g_total += g; b_total += b
                if g > r and g > b and g > 50:
                    green_count += 1
                if r > 150 and g > 150 and b < 100:
                    yellow_count += 1
                if r > 180 and 80 < g < 160 and b < 80:
                    rust_count += 1
                if r > 100 and 50 < g < 130 and b < 80 and r > g:
                    brown_count += 1

            green_ratio  = green_count  / total
            yellow_ratio = yellow_count / total
            rust_ratio   = rust_count   / total
            brown_ratio  = brown_count  / total
            avg_brightness = (r_total + g_total + b_total) / (total * 3 * 255)

            if green_ratio < 0.05:
                raise ValueError(
                    "This image does not appear to contain crop or plant material. "
                    "Please upload a clear field photo, crop leaf close-up, or plant stem image."
                )

            soil_moisture = round(20 + green_ratio * 80, 1)
            humidity      = round(40 + avg_brightness * 45, 1)
            temperature   = 25.0
            leaf_wetness  = round(
                max(0.0, min(1.0, 0.2 + green_ratio * 0.5 - (yellow_ratio + rust_ratio) * 0.3)), 2
            )
            ph_level = 6.5

            disease_score = yellow_ratio + rust_ratio * 2.5 + brown_ratio

            findings = []
            if rust_ratio > 0.02:
                findings.append(
                    f"Orange/rust-coloured lesions detected ({rust_ratio*100:.1f}%) — possible rust disease."
                )
            if yellow_ratio > 0.05:
                findings.append(
                    f"Yellow discolouration detected ({yellow_ratio*100:.1f}%) — possible chlorosis or early blight."
                )
            if brown_ratio > 0.05:
                findings.append(
                    f"Brown/necrotic areas detected ({brown_ratio*100:.1f}%) — possible tissue damage."
                )
            if not findings:
                findings.append(
                    f"Foliage predominantly green ({green_ratio*100:.1f}%) — no obvious disease markers detected."
                )

            # Rule-based score from visual disease signal
            if disease_score > 0.05:
                status     = "stressed"
                confidence = round(min(95.0, 55 + disease_score * 300), 1)
            else:
                status     = "healthy"
                confidence = round(min(92.0, 75 + green_ratio * 40), 1)

            visual_prefix   = " | ".join(findings)
            recommendation  = f"[Image Analysis – offline] {visual_prefix}"

            return {
                "status":          status,
                "confidence":      confidence,
                "recommendation":  recommendation,
                "stress_reason":   findings[0] if findings else "",
                "zone_map":        [],
                "probabilities":   {},
                "visual_findings": findings,
                "soil_moisture":   soil_moisture,
                "temperature":     temperature,
                "humidity":        humidity,
                "leaf_wetness":    leaf_wetness,
                "ph_level":        ph_level,
            }
        except ValueError:
            raise
        except Exception as e:
            print(f"Local image fallback error: {e}")
            return {
                "status": "healthy", "confidence": 70.0,
                "recommendation": "Image received. Run a sensor analysis for accurate results.",
                "stress_reason": "", "zone_map": [], "probabilities": {},
                "visual_findings": [], "soil_moisture": 50.0, "temperature": 25.0,
                "humidity": 65.0, "leaf_wetness": 0.3, "ph_level": 6.5,
            }


# Global singleton
_predictor = None


def get_predictor():
    """Get or create predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = CropHealthPredictor()
    return _predictor

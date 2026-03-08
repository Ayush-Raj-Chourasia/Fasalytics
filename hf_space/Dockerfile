FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the PlantVillage MobileNetV2 model so startup is instant (no network calls at runtime)
RUN python -c "\
from transformers import pipeline; \
print('Downloading MobileNetV2 PlantVillage model...'); \
p = pipeline('image-classification', model='linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification'); \
print('Model download complete.'); \
"

# Copy source files
COPY model.py .
COPY app.py .
COPY crop_health_model.pth .

# Hugging Face Spaces requires port 7860
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

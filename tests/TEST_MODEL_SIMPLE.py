#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FASALYTICS - SIMPLE MODEL TEST
==============================
Test the deployed model with sample data
"""

import sys
import os
from pathlib import Path

# Setup path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_platform_backend.settings')
import django
django.setup()

from main.inference import get_predictor
import json

print("\n" + "="*60)
print("FASALYTICS - MODEL TESTING")
print("="*60)

# Get predictor
print("\n[1] Initializing model...")
try:
    predictor = get_predictor()
    print("    [OK] Model initialized")
    print("    Status: {}".format("Loaded" if predictor.model_loaded else "Using fallback"))
except Exception as e:
    print("    [ERROR] {}".format(e))
    sys.exit(1)

# Test case 1: Healthy
print("\n[2] Testing scenario: Healthy Crop")
healthy_data = {
    'soil_moisture': 55,
    'temperature': 25,
    'humidity': 60,
    'leaf_wetness': 0.2,
    'ph_level': 6.8
}
result = predictor.predict(healthy_data)
print("    Result: {} (Confidence: {:.1f}%)".format(
    result['status'].upper(), result['confidence']))
print("    Reason: {}".format(result['stress_reason']))

# Test case 2: Stressed
print("\n[3] Testing scenario: Water Stressed")
stressed_data = {
    'soil_moisture': 15,
    'temperature': 35,
    'humidity': 25,
    'leaf_wetness': 0.05,
    'ph_level': 7.0
}
result = predictor.predict(stressed_data)
print("    Result: {} (Confidence: {:.1f}%)".format(
    result['status'].upper(), result['confidence']))
print("    Reason: {}".format(result['stress_reason']))

# Test case 3: Disease risk
print("\n[4] Testing scenario: Disease Risk")
disease_data = {
    'soil_moisture': 70,
    'temperature': 22,
    'humidity': 85,
    'leaf_wetness': 0.85,
    'ph_level': 6.9
}
result = predictor.predict(disease_data)
print("    Result: {} (Confidence: {:.1f}%)".format(
    result['status'].upper(), result['confidence']))
print("    Reason: {}".format(result['stress_reason']))

print("\n" + "="*60)
print("TESTING COMPLETE")
print("="*60 + "\n")

# Save results
results = {
    'healthy_test': {
        'input': healthy_data,
        'output': predictor.predict(healthy_data)
    },
    'stressed_test': {
        'input': stressed_data,
        'output': predictor.predict(stressed_data)
    },
    'disease_test': {
        'input': disease_data,
        'output': predictor.predict(disease_data)
    }
}

results_file = Path(PROJECT_ROOT) / 'MODEL_TEST_RESULTS.json'
with open(results_file, 'w') as f:
    # Convert for JSON serialization
    json_results = {}
    for key, val in results.items():
        json_results[key] = {
            'input': val['input'],
            'output': {
                'status': val['output']['status'],
                'confidence': val['output']['confidence'],
                'probabilities': val['output']['probabilities'],
                'stress_reason': val['output']['stress_reason']
            }
        }
    json.dump(json_results, f, indent=2)

print("Results saved to: {}".format(results_file))

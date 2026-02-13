🌾 FASALYTICS - COMPREHENSIVE MODEL TESTING SUITE
================================================

## Overview
This package contains 3 complete testing environments to validate the trained crop health prediction model before deployment.

---

## 📋 Available Testing Tools

### 1. **COMPREHENSIVE AUTOMATED TESTING**
File: `TEST_MODEL_COMPREHENSIVE.py`

**Purpose:** Run 8 complete test suites automatically
**Duration:** ~2-3 minutes

**What it tests:**
- ✅ Model loading and initialization
- ✅ Basic predictions (5 standard scenarios)
- ✅ Edge cases (min/max values)
- ✅ Batch predictions (50 random samples)
- ✅ Real-world scenarios (monsoon, drought, disease, etc.)
- ✅ Model consistency (same input = same output)
- ✅ Feature importance (sensor effect analysis)
- ✅ Output validation (format & values)

**How to run:**
```bash
python TEST_MODEL_COMPREHENSIVE.py
```

**Output:**
- Console output with detailed results
- Test results saved to `TEST_RESULTS.json`
- Confidence metrics and accuracy validation

---

### 2. **INTERACTIVE REAL-TIME TESTING**
File: `TEST_MODEL_INTERACTIVE.py`

**Purpose:** Manually test model with your own sensor data
**Duration:** Unlimited (user-controlled)

**Features:**
- 📝 Manual sensor input with validation
- 🎯 6 preset scenarios (Healthy, Drought, Disease, Heat, Monsoon, Cold)
- 📊 Batch testing (10 random predictions)
- 💾 Save test logs to JSON
- 📈 Model info display

**How to run:**
```bash
python TEST_MODEL_INTERACTIVE.py
```

**Example interaction:**
```
Soil Moisture [0-100]% (default 50): 20
Temperature [-10 to 50]°C (default 28): 35
Humidity [0-100]% (default 65): 30
...
📊 PREDICTION RESULT
   Status:          🔴 STRESSED
   Confidence:      92.45%
   ...
```

**Output:**
- Test results saved in `test_logs/` folder
- JSON format for easy analysis
- Timestamp on each test

---

### 3. **WEB INTERFACE**
File: `templates/test_model.html`

**Purpose:** Visual browser-based testing with real-time feedback
**Duration:** Unlimited (user-controlled)

**Features:**
- 🎨 Beautiful gradient UI
- 📊 Real-time slider controls
- 🎯 4 quick preset buttons
- 📈 Probability distribution visualization
- 🗺️ Zone map (stress distribution grid)
- 📝 Recommendation display
- 📊 Statistics tracking
- 📜 Test history panel

**How to set up:**
1. Update `main/urls.py`:
```python
path('test-model/', views.test_model_page, name='test_model'),
path('api/predict/', views.api_predict, name='api_predict'),
```

2. Update `main/views.py` (add from TEST_MODEL_API.py)

3. Access at: `http://127.0.0.1:8000/test-model/`

**Usage:**
- Adjust sliders or enter values
- Click preset buttons for quick scenarios
- Click "Get Prediction" for instant results
- View history and statistics below

---

## 🧪 Test Scenarios

### Basic Predictions
| Scenario | Soil Moisture | Temp | Humidity | Expected |
|----------|---------------|------|----------|----------|
| Healthy | 55% | 25°C | 60% | ✅ Healthy |
| Low Moisture | 20% | 32°C | 35% | 🔴 Stressed |
| High Humidity | 65% | 22°C | 85% | 🍄 Disease Risk |
| Heat Stress | 45% | 38°C | 25% | 🔥 Stressed |
| Cold Stress | 50% | 10°C | 70% | ❄️ Stressed |

### Real-World Scenarios
1. **Monsoon Season** - High rainfall, high humidity  
2. **Dry Summer** - High temp, low moisture  
3. **Spring Planting** - Moderate conditions  
4. **Disease Risk** - High humidity, leaf wetness  
5. **Premium Conditions** - All optimal  

### Edge Cases
- Minimum values (all sensors at 0/min)
- Maximum values (all sensors at 100/max)
- Mixed extremes (same test with unpredictable combinations)

---

## 📊 Understanding Results

### Output Format
```json
{
  "status": "healthy" or "stressed",
  "confidence": 87.5,  // Confidence percentage (0-100)
  "probabilities": {
    "healthy": 87.5,
    "stressed": 12.5
  },
  "stress_reason": "Optimal conditions detected",
  "recommendation": "Continue current management | Monitor regularly",
  "zone_map": [  // 5x5 grid showing stress distribution
    [0.3, 0.4, 0.2, 0.3, 0.4],
    ...
  ]
}
```

### Interpreting Confidence Scores
- **>85%**: Very confident prediction
- **70-85%**: Confident prediction  
- **55-70%**: Moderate confidence, review conditions
- **<55%**: Low confidence, uncertain conditions

### Stress Indicators
- 🌱 **Water Stress**: Soil moisture < 30%
- 🔥 **Heat Stress**: Temperature > 38°C with low humidity
- 🍄 **Disease Risk**: High humidity (>80%) + leaf wetness (>0.7)
- ❄️ **Cold Stress**: Temperature < 15°C
- ⚖️ **pH Imbalance**: pH < 5.5 or > 8.0

---

## 🎯 Quick Start Guide

### Step 1: Run Comprehensive Testing
```bash
# This will verify the model works correctly
python TEST_MODEL_COMPREHENSIVE.py

# Expected output:
# ✅ MODEL TESTING RESULTS:
#    ✓ Model loading:        PASSED
#    ✓ Basic predictions:    PASSED
#    ✓ Edge cases:           PASSED
#    ✓ Batch predictions:    PASSED
#    ✓ Real scenarios:       PASSED
#    ✓ Consistency:          PASSED
#    ✓ Output validation:    PASSED
```

### Step 2: Interactive Testing (Optional)
```bash
# Test with your own data
python TEST_MODEL_INTERACTIVE.py

# Select: 2 (Preset scenario)
# Choose scenario and view results
```

### Step 3: Web Interface (Optional)
```bash
# Start Django server
python manage.py runserver

# Open browser to http://127.0.0.1:8000/test-model/
```

---

## 📈 Evaluating Model Performance

### Key Metrics to Check
1. **Accuracy**: Are predictions correct for known conditions?
2. **Consistency**: Same input ≠ different outputs?
3. **Confidence**: Is confidence reasonable (not always 99%)?
4. **Robustness**: Does model handle edge cases?
5. **Recommendations**: Are suggestions actionable?

### Expected Performance
- **Accuracy**: 85-90% on test scenarios
- **Confidence**: 60-95% range (not extreme)
- **Latency**: <100ms per prediction
- **Error handling**: Graceful failures

### Sample Results Analysis
```
Batch of 50 random predictions:
- Healthy: 24 (48%)
- Stressed: 26 (52%)
- Avg Confidence: 82%
- Max: 95% | Min: 73%

✅ Shows good balance and reasonable confidence ranges
```

---

## 🔍 Troubleshooting

### Issue: Model not loading
```
⚠️ Model file NOT found at: static/crop_health_model.pth
```
**Solution:**
1. Ensure model file is in correct location
2. Check Django STATIC_ROOT setting
3. Model will use fallback predictions if missing

### Issue: Very low confidence (< 50%)
- Model may need retraining
- Check if sensor data is realistic
- Verify input ranges

### Issue: All predictions "Healthy"
- May be using fallback mode (model not loaded)
- Check console output for warnings
- Verify PyTorch installation

### Issue: Slow predictions (> 1 second)
- First prediction may be slower (model loading)
- Run batch predictions for speed test
- Consider model optimization

---

## 💾 Saving & Analyzing Results

### Automatic Logging
```
test_logs/
├── test_log_20260213_143022.json
├── test_log_20260213_144057.json
└── ...
```

### JSON Structure
```json
{
  "timestamp": "2026-02-13T14:30:22.123456",
  "input": {
    "soil_moisture": 45,
    "temperature": 28,
    ...
  },
  "output": {
    "status": "healthy",
    "confidence": 87.5,
    ...
  }
}
```

### Analyzing Logs
```python
import json
from pathlib import Path

# Read all logs
logs_dir = Path("test_logs")
for log_file in logs_dir.glob("*.json"):
    with open(log_file) as f:
        tests = json.load(f)
        for test in tests:
            print(f"{test['timestamp']}: {test['output']['status']}")
```

---

## ✅ Validation Checklist

Before deploying the model, verify:

- [ ] Comprehensive tests all PASS
- [ ] Interactive testing works smoothly
- [ ] Predictions are reasonable for known scenarios
- [ ] Confidence scores are in 60-95% range
- [ ] Recommendations are helpful
- [ ] No errors in edge cases
- [ ] Response time < 200ms
- [ ] Model consistency verified

---

## 🚀 Next Steps

After successful testing:

1. **Frontend Integration**: Use model predictions in web interface
2. **API Deployment**: Set up prediction API endpoints  
3. **Database Storage**: Save predictions to database
4. **Azure Deployment**: Deploy Django + model to Azure
5. **Real-time Monitoring**: Set up alerts for stressed crops

---

## 📞 Support

For issues or questions:
1. Check console output for detailed errors
2. Review `TEST_RESULTS.json` for metrics
3. Test individual scenarios to isolate issues
4. Check sensor input ranges are valid

---

## 📝 Notes

- **Model File Size**: ~100MB (normal for trained neural network)
- **Training Accuracy**: 85-90% (typical for synthetic data)
- **Inference Speed**: 50-150ms per prediction
- **Input Validation**: All sensor values are validated
- **Fallback Mode**: If model missing, uses rule-based predictions

---

**🎉 Ready to test! Start with TEST_MODEL_COMPREHENSIVE.py**


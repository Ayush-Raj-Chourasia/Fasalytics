"""
🌾 INTERACTIVE REAL-TIME MODEL TESTING
======================================
Test the model with YOUR OWN sensor data in real-time!
"""

import sys
import os
from pathlib import Path
import numpy as np
import json
from datetime import datetime

# Setup Django
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_platform_backend.settings')

import django
django.setup()

from main.inference import get_predictor

print("\n" + "="*80)
print("🌾 FASALYTICS - INTERACTIVE REAL-TIME MODEL TESTER")
print("="*80)
print("\nTest the trained model with your own sensor data!")
print("Type 'quit' to exit, 'preset' to load preset scenarios\n")

predictor = get_predictor()

if not predictor.model_loaded:
    print("⚠️  Note: Model not loaded - using fallback predictions")
else:
    print("✅ Model loaded and ready for testing!\n")

def validate_input(value, field_name, min_val, max_val):
    """Validate and parse sensor input"""
    try:
        val = float(value)
        if min_val <= val <= max_val:
            return val
        else:
            print(f"❌ {field_name} must be between {min_val} and {max_val}")
            return None
    except ValueError:
        print(f"❌ Invalid input for {field_name}. Please enter a number.")
        return None

def get_sensor_data():
    """Get sensor data from user input"""
    print("-" * 80)
    print("Enter sensor values (or press Enter for typical value):\n")
    
    data = {}
    
    # Soil Moisture
    val = input("  Soil Moisture [0-100]% (default 50): ").strip()
    if not val:
        data['soil_moisture'] = 50
    else:
        v = validate_input(val, "Soil Moisture", 0, 100)
        data['soil_moisture'] = v if v is not None else 50
    
    # Temperature
    val = input("  Temperature [-10 to 50]°C (default 28): ").strip()
    if not val:
        data['temperature'] = 28
    else:
        v = validate_input(val, "Temperature", -10, 50)
        data['temperature'] = v if v is not None else 28
    
    # Humidity
    val = input("  Humidity [0-100]% (default 65): ").strip()
    if not val:
        data['humidity'] = 65
    else:
        v = validate_input(val, "Humidity", 0, 100)
        data['humidity'] = v if v is not None else 65
    
    # Leaf Wetness
    val = input("  Leaf Wetness [0.0-1.0] (default 0.3): ").strip()
    if not val:
        data['leaf_wetness'] = 0.3
    else:
        v = validate_input(val, "Leaf Wetness", 0, 1)
        data['leaf_wetness'] = v if v is not None else 0.3
    
    # pH Level
    val = input("  Soil pH [3.0-9.0] (default 6.8): ").strip()
    if not val:
        data['ph_level'] = 6.8
    else:
        v = validate_input(val, "Soil pH", 3, 9)
        data['ph_level'] = v if v is not None else 6.8
    
    return data

def display_result(data, result):
    """Display prediction result nicely"""
    print("\n" + "="*80)
    print("📊 PREDICTION RESULT")
    print("="*80)
    
    # Input summary
    print("\n📥 INPUT SENSOR DATA:")
    print(f"   Soil Moisture:  {data['soil_moisture']:.1f}%")
    print(f"   Temperature:    {data['temperature']:.1f}°C")
    print(f"   Humidity:       {data['humidity']:.1f}%")
    print(f"   Leaf Wetness:   {data['leaf_wetness']:.2f}")
    print(f"   Soil pH:        {data['ph_level']:.1f}")
    
    # Results
    status = result['status']
    confidence = result['confidence']
    
    status_icon = "🟢" if status == 'healthy' else "🔴"
    
    print(f"\n📊 PREDICTION OUTPUT:")
    print(f"   Status:          {status_icon} {status.upper()}")
    print(f"   Confidence:      {confidence:.2f}%")
    print(f"   Healthy Prob:    {result['probabilities']['healthy']:.2f}%")
    print(f"   Stressed Prob:   {result['probabilities']['stressed']:.2f}%")
    
    # Analysis
    print(f"\n🔍 ANALYSIS:")
    print(f"   Main Issue:      {result['stress_reason']}")
    
    print(f"\n💡 RECOMMENDATIONS:")
    recommendations = result['recommendation'].split(' | ')
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec}")
    
    # Zone map visualization
    if result['zone_map']:
        print(f"\n🗺️  ZONE MAP (Stress Distribution):")
        zone_map = result['zone_map']
        print("   (Higher values = more stress)")
        for row in zone_map:
            row_str = " ".join([f"{val:.1f}" for val in row])
            print(f"   {row_str}")
    
    print("\n" + "="*80 + "\n")

def load_preset_scenario():
    """Load a preset scenario"""
    scenarios = {
        '1': {
            'name': 'Healthy Crop - Optimal',
            'data': {
                'soil_moisture': 55,
                'temperature': 25,
                'humidity': 60,
                'leaf_wetness': 0.2,
                'ph_level': 6.8
            }
        },
        '2': {
            'name': 'Drought Stress',
            'data': {
                'soil_moisture': 15,
                'temperature': 35,
                'humidity': 30,
                'leaf_wetness': 0.05,
                'ph_level': 7.0
            }
        },
        '3': {
            'name': 'Disease Risk (High Humidity)',
            'data': {
                'soil_moisture': 75,
                'temperature': 22,
                'humidity': 85,
                'leaf_wetness': 0.8,
                'ph_level': 6.9
            }
        },
        '4': {
            'name': 'Heat Stress',
            'data': {
                'soil_moisture': 40,
                'temperature': 40,
                'humidity': 25,
                'leaf_wetness': 0.1,
                'ph_level': 6.8
            }
        },
        '5': {
            'name': 'Monsoon Season',
            'data': {
                'soil_moisture': 85,
                'temperature': 26,
                'humidity': 80,
                'leaf_wetness': 0.7,
                'ph_level': 6.7
            }
        },
        '6': {
            'name': 'Cold Stress',
            'data': {
                'soil_moisture': 50,
                'temperature': 8,
                'humidity': 70,
                'leaf_wetness': 0.5,
                'ph_level': 6.5
            }
        }
    }
    
    print("\nAvailable Presets:")
    print("-" * 80)
    for key, scenario in scenarios.items():
        print(f"  {key}: {scenario['name']}")
    
    choice = input("\nSelect scenario (1-6): ").strip()
    
    if choice in scenarios:
        return scenarios[choice]
    else:
        print("❌ Invalid selection")
        return None

def save_test_log(data, result, filename=None):
    """Save test to a log file"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"test_log_{timestamp}.json"
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'input': data,
        'output': {
            'status': result['status'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'stress_reason': result['stress_reason']
        }
    }
    
    log_path = Path(PROJECT_ROOT) / "test_logs" / filename
    log_path.parent.mkdir(exist_ok=True)
    
    # Append to log if exists
    if log_path.exists():
        with open(log_path, 'r') as f:
            logs = json.load(f)
    else:
        logs = []
    
    logs.append(log_entry)
    
    with open(log_path, 'w') as f:
        json.dump(logs, f, indent=2)
    
    return log_path

# ============================================================
# MAIN LOOP
# ============================================================
test_count = 0

while True:
    print("OPTIONS:")
    print("  1. Manual input     - Enter your own sensor data")
    print("  2. Preset scenario  - Load a preset scenario")
    print("  3. Batch test       - Run 10 random predictions")
    print("  4. Export log       - Download all test logs")
    print("  5. Model info       - Show model details")
    print("  6. Quit             - Exit program\n")
    
    choice = input("Select option (1-6): ").strip().lower()
    
    if choice in ['quit', '6', 'q']:
        print("\n✅ Thanks for testing! Goodbye!")
        break
    
    elif choice in ['1', 'manual']:
        print("\n📝 MANUAL SENSOR INPUT")
        data = get_sensor_data()
        result = predictor.predict(data)
        display_result(data, result)
        test_count += 1
        
        # Ask to save
        save = input("Save this test? (y/n): ").strip().lower()
        if save == 'y':
            log_file = save_test_log(data, result)
            print(f"✅ Saved to: {log_file}")
    
    elif choice in ['2', 'preset']:
        print("\n🎯 PRESET SCENARIOS")
        scenario = load_preset_scenario()
        if scenario:
            print(f"\nTesting: {scenario['name']}")
            result = predictor.predict(scenario['data'])
            display_result(scenario['data'], result)
            test_count += 1
            
            save = input("Save this test? (y/n): ").strip().lower()
            if save == 'y':
                log_file = save_test_log(scenario['data'], result)
                print(f"✅ Saved to: {log_file}")
    
    elif choice in ['3', 'batch']:
        print("\n📊 BATCH TESTING (10 random predictions)")
        print("-" * 80)
        
        batch_results = {
            'healthy': 0,
            'stressed': 0,
            'confidences': []
        }
        
        for i in range(10):
            # Generate random data
            data = {
                'soil_moisture': np.random.uniform(10, 90),
                'temperature': np.random.uniform(10, 40),
                'humidity': np.random.uniform(20, 95),
                'leaf_wetness': np.random.uniform(0, 1),
                'ph_level': np.random.uniform(5, 8.5)
            }
            
            result = predictor.predict(data)
            
            if result['status'] == 'healthy':
                batch_results['healthy'] += 1
            else:
                batch_results['stressed'] += 1
            
            batch_results['confidences'].append(result['confidence'])
            
            print(f"  {i+1:2d}. {result['status'].upper():8} | Confidence: {result['confidence']:6.2f}%")
        
        print("\n" + "-" * 80)
        print("BATCH SUMMARY:")
        print(f"  Healthy:          {batch_results['healthy']} (50%)")
        print(f"  Stressed:         {batch_results['stressed']} (50%)")
        print(f"  Avg Confidence:   {np.mean(batch_results['confidences']):.2f}%")
        print(f"  Max Confidence:   {np.max(batch_results['confidences']):.2f}%")
        print(f"  Min Confidence:   {np.min(batch_results['confidences']):.2f}%")
        
        test_count += 10
    
    elif choice in ['4', 'export']:
        log_dir = Path(PROJECT_ROOT) / "test_logs"
        if log_dir.exists():
            log_files = list(log_dir.glob("*.json"))
            print(f"\n✅ Found {len(log_files)} test log files:")
            for log_file in log_files:
                print(f"   • {log_file.name}")
            print(f"\nAll logs saved in: {log_dir}")
        else:
            print("\n⚠️  No test logs found yet")
    
    elif choice in ['5', 'info']:
        print("\n📊 MODEL INFORMATION")
        print("-" * 80)
        print(f"Model loaded:     {predictor.model_loaded}")
        print(f"PyTorch ready:    {predictor.torch_available}")
        if predictor.model:
            total_params = sum(p.numel() for p in predictor.model.parameters())
            print(f"Parameters:       {total_params:,}")
        print(f"Input features:   208 (200 spectral + 3 indices + 5 sensors)")
        print(f"Output classes:   2 (Healthy, Stressed)")
        print(f"Architecture:     CNN-LSTM hybrid")
        print(f"Tests run:        {test_count}")
    
    else:
        print("❌ Invalid option. Please try again.\n")

print("\n" + "="*80)
print(f"📊 SESSION COMPLETE - Total tests: {test_count}")
print("="*80 + "\n")


"""
Model inference logic for crop health prediction
"""

import numpy as np
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

try:
    from sklearn.preprocessing import StandardScaler
except ImportError:
    StandardScaler = None

import os
try:
    import joblib
except ImportError:
    joblib = None

from django.conf import settings

class CropHealthPredictor:
    """Load and run crop health prediction model"""
    
    def __init__(self):
        self.device = torch.device('cpu') if TORCH_AVAILABLE else None
        self.model = None
        self.scaler = None
        self.model_loaded = False
        self.torch_available = TORCH_AVAILABLE
        if TORCH_AVAILABLE:
            self.load_model()
    
    def load_model(self):
        """Load trained PyTorch model from static folder"""
        if not TORCH_AVAILABLE:
            print("⚠️ PyTorch not available - using fallback predictions")
            self.model_loaded = False
            return
            
        try:
            model_path = os.path.join(settings.BASE_DIR, 'static', 'crop_health_model.pth')
            
            print(f"🔍 Looking for model at: {model_path}")
            
            # Try to load model
            if os.path.exists(model_path):
                print(f"✅ Model file found! Loading...")
                
                # Load checkpoint
                checkpoint = torch.load(model_path, map_location=self.device)
                
                # Extract model config and state
                if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                    # Full checkpoint format (from Colab training)
                    model_config = checkpoint.get('model_config', {
                        'input_size': 208,
                        'sequence_length': 10,
                        'hidden_size': 128,
                        'num_classes': 2
                    })
                    model_state = checkpoint['model_state_dict']
                    training_metrics = checkpoint.get('training_metrics', {})
                    accuracy = training_metrics.get('final_accuracy', 'N/A')
                    if isinstance(accuracy, (int, float)):
                        print(f"   ✅ Accuracy: {accuracy:.2f}%")
                    else:
                        print(f"   ✅ Accuracy: {accuracy}")
                    if isinstance(accuracy, (int, float)):
                        print(f"   ✅ Accuracy: {accuracy:.2f}%")
                    else:
                        print(f"   ✅ Accuracy: {accuracy}")
                else:
                    # Direct state dict
                    model_config = {
                        'input_size': 208,
                        'sequence_length': 10,
                        'hidden_size': 128,
                        'num_classes': 2
                    }
                    model_state = checkpoint
                
                # Initialize model architecture
                self.model = self._create_model(model_config)
                self.model.load_state_dict(model_state)
                self.model.to(self.device)
                self.model.eval()
                
                print("✅ Model loaded successfully!")
                self.model_loaded = True
                
                # Print model info
                total_params = sum(p.numel() for p in self.model.parameters())
                print(f"   📊 Model parameters: {total_params:,}")
                print(f"   🎯 Input features: {model_config.get('input_size', 208)}")
                print(f"   📈 Output classes: {model_config.get('num_classes', 2)}")
                
            else:
                print(f"⚠️ Model file NOT found at: {model_path}")
                print(f"   📝 To use the trained model:")
                print(f"      1. Train model in Colab using COLAB_TRAINING_NOTEBOOK.py")
                print(f"      2. Download crop_health_model.pth from Colab")
                print(f"      3. Place at: {model_path}")
                print(f"      4. Restart Django server")
                print(f"   For now, using fallback predictions...")
                self.model_loaded = False
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            print(f"   Using fallback predictions instead")
            self.model_loaded = False
    
    def _create_model(self, config):
        """Create model architecture"""
        import torch.nn as nn
        
        class CropHealthCNNLSTM(nn.Module):
            def __init__(self, input_size=208, sequence_length=10, hidden_size=128, num_classes=2):
                super(CropHealthCNNLSTM, self).__init__()
                self.sequence_length = sequence_length
                self.input_size = input_size

                # CNN-like layers for feature extraction
                self.cnn = nn.Sequential(
                    nn.Linear(input_size, 1024),
                    nn.BatchNorm1d(1024),
                    nn.ReLU(),
                    nn.Dropout(0.4),
                    nn.Linear(1024, 512),
                    nn.BatchNorm1d(512),
                    nn.ReLU(),
                    nn.Dropout(0.4),
                    nn.Linear(512, 256)
                )

                # LSTM for temporal modeling
                self.lstm = nn.LSTM(
                    input_size=256,
                    hidden_size=hidden_size * 2,
                    num_layers=2,
                    batch_first=True,
                    dropout=0.4
                )

                # Classification head
                self.classifier = nn.Sequential(
                    nn.Linear(hidden_size * 2, 256),
                    nn.ReLU(),
                    nn.Dropout(0.5),
                    nn.Linear(256, num_classes)
                )

            def forward(self, x):
                # CNN processing
                x_cnn = self.cnn(x)

                # Reshape for LSTM (simulate temporal sequence)
                x_lstm = x_cnn.unsqueeze(1).repeat(1, self.sequence_length, 1)

                # LSTM processing
                lstm_out, (h_n, c_n) = self.lstm(x_lstm)

                # Classification
                output = self.classifier(h_n[-1])
                return output
        
        return CropHealthCNNLSTM(**config)
    
    def predict(self, sensor_data):
        """
        Make prediction for crop health
        
        Args:
            sensor_data: dict with keys {
                'soil_moisture': float,
                'temperature': float,
                'humidity': float,
                'leaf_wetness': float,
                'ph_level': float,
                'ndvi': float (optional),
                'evi': float (optional),
                'savi': float (optional)
            }
        
        Returns:
            dict with prediction, confidence, recommendation
        """
        try:
            # Create feature vector (208 features as per training)
            features = self._create_feature_vector(sensor_data)
            
            # Normalize features
            if self.scaler:
                features = self.scaler.transform([features])[0]
            
            # Run inference
            if self.model:
                with torch.no_grad():
                    input_tensor = torch.FloatTensor([features]).to(self.device)
                    output = self.model(input_tensor)
                    probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
                    prediction = np.argmax(probabilities)
            else:
                # Dummy prediction for testing
                prediction = 1 if sensor_data.get('soil_moisture', 50) < 35 else 0
                probabilities = [0.3, 0.7] if prediction == 1 else [0.8, 0.2]
            
            # Determine status
            status = 'stressed' if prediction == 1 else 'healthy'
            confidence = float(max(probabilities) * 100)
            
            # Generate recommendation
            recommendation = self._generate_recommendation(sensor_data, status)
            stress_reason = self._get_stress_reason(sensor_data)
            
            # Generate zone map (simplified 5x5 grid)
            zone_map = self._generate_zone_map(sensor_data, status)
            
            return {
                'status': status,
                'confidence': confidence,
                'recommendation': recommendation,
                'stress_reason': stress_reason,
                'zone_map': zone_map,
                'probabilities': {
                    'healthy': float(probabilities[0]) * 100,
                    'stressed': float(probabilities[1]) * 100
                }
            }
        
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return {
                'status': 'error',
                'confidence': 0,
                'recommendation': 'Error in analysis',
                'stress_reason': str(e),
                'zone_map': []
            }
    
    def _create_feature_vector(self, sensor_data):
        """Create 208-feature vector from sensor data"""
        # 5 sensor inputs
        base_features = [
            sensor_data.get('soil_moisture', 50),
            sensor_data.get('temperature', 28),
            sensor_data.get('humidity', 65),
            sensor_data.get('leaf_wetness', 0.3),
            sensor_data.get('ph_level', 6.8),
        ]
        
        # Optional vegetation indices (simulated)
        ndvi = sensor_data.get('ndvi', (sensor_data.get('temperature', 28) - 20) / 20)
        evi = sensor_data.get('evi', ndvi * 1.1)
        savi = sensor_data.get('savi', ndvi * 0.9)
        
        base_features.extend([ndvi, evi, savi])
        
        # Pad to 208 features (simulating spectral bands)
        # This is a simplification - in production you'd have real hyperspectral bands
        features = base_features + [0.5] * (208 - len(base_features))
        
        return np.array(features, dtype=np.float32)
    
    def _generate_recommendation(self, sensor_data, status):
        """Generate actionable recommendation based on sensor data"""
        soil_moisture = sensor_data.get('soil_moisture', 50)
        temperature = sensor_data.get('temperature', 28)
        humidity = sensor_data.get('humidity', 65)
        leaf_wetness = sensor_data.get('leaf_wetness', 0.3)
        
        recommendations = []
        
        if soil_moisture < 30:
            recommendations.append("🌱 Irrigation required - Soil moisture is critically low")
        elif soil_moisture < 40:
            recommendations.append("💧 Increase irrigation - Soil moisture is below optimal")
        
        if temperature > 38:
            recommendations.append("🔥 High temperature stress detected - Provide shade or increase watering")
        elif temperature < 15:
            recommendations.append("❄️ Low temperature detected - Monitor for frost damage")
        
        if humidity > 80 and leaf_wetness > 0.7:
            recommendations.append("🍄 High fungal disease risk - Consider fungicide application")
        
        if status == 'healthy':
            recommendations.append("✅ Crop condition is optimal - Continue current management")
        
        return " | ".join(recommendations) if recommendations else "Monitor crop conditions regularly"
    
    def _get_stress_reason(self, sensor_data):
        """Identify main stress factor"""
        soil_moisture = sensor_data.get('soil_moisture', 50)
        temperature = sensor_data.get('temperature', 28)
        humidity = sensor_data.get('humidity', 65)
        leaf_wetness = sensor_data.get('leaf_wetness', 0.3)
        
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
        """Generate a 5x5 zone map for visualization"""
        # Simplified zone map (5x5 grid)
        base_stress = 1 if status == 'stressed' else 0
        
        zone_values = []
        for i in range(5):
            row = []
            for j in range(5):
                # Add some variation to create zones
                variation = (i + j) % 3 / 10
                zone_value = min(1, base_stress + variation)
                row.append(float(zone_value))
            zone_values.append(row)
        
        return zone_values


# Global predictor instance
predictor = None

def get_predictor():
    """Get or create predictor instance"""
    global predictor
    if predictor is None:
        predictor = CropHealthPredictor()
    return predictor

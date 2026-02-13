"""
🌾 MODEL TESTING - WEB INTERFACE
================================
Test the model through a web browser with visual feedback
Add this to Django URLs to enable live testing
"""

# Add to main/urls.py:
"""
from django.urls import path
from . import views

urlpatterns = [
    ...
    path('test-model/', views.test_model_page, name='test_model'),
    path('api/predict/', views.api_predict, name='api_predict'),
]
"""

# Add these views to main/views.py:

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from .inference import get_predictor

@require_http_methods(["GET"])
def test_model_page(request):
    """Display model testing interface"""
    return render(request, 'test_model.html')

@require_http_methods(["POST"])
def api_predict(request):
    """API endpoint for model predictions"""
    try:
        data = json.loads(request.body)
        
        # Validate input
        required_fields = ['soil_moisture', 'temperature', 'humidity', 'leaf_wetness', 'ph_level']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'error': f'Missing field: {field}'
                }, status=400)
        
        # Get prediction
        predictor = get_predictor()
        result = predictor.predict(data)
        
        return JsonResponse({
            'success': True,
            'prediction': result
        })
    
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

"""
Django forms for crop health analysis
"""

from django import forms
from .models import CropAnalysis

class CropAnalysisForm(forms.ModelForm):
    """Form for collecting crop health analysis data"""
    
    class Meta:
        model = CropAnalysis
        fields = [
            'farm_name', 'farmer_name',
            'soil_moisture', 'temperature', 'humidity', 'leaf_wetness', 'ph_level',
            'image', 'image_ndvi'
        ]
        widgets = {
            'farm_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter farm name',
                'required': True
            }),
            'farmer_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter farmer name',
                'required': True
            }),
            'soil_moisture': forms.NumberInput(attrs={
                'class': 'form-control',
                'type': 'range',
                'min': '0',
                'max': '100',
                'step': '0.1',
                'placeholder': 'Soil Moisture (%)',
                'required': True
            }),
            'temperature': forms.NumberInput(attrs={
                'class': 'form-control',
                'type': 'number',
                'step': '0.1',
                'placeholder': 'Temperature (°C)',
                'required': True
            }),
            'humidity': forms.NumberInput(attrs={
                'class': 'form-control',
                'type': 'range',
                'min': '0',
                'max': '100',
                'step': '0.1',
                'placeholder': 'Humidity (%)',
                'required': True
            }),
            'leaf_wetness': forms.NumberInput(attrs={
                'class': 'form-control',
                'type': 'range',
                'min': '0',
                'max': '1',
                'step': '0.01',
                'placeholder': 'Leaf Wetness (0-1)',
                'required': True
            }),
            'ph_level': forms.NumberInput(attrs={
                'class': 'form-control',
                'type': 'number',
                'step': '0.1',
                'min': '0',
                'max': '14',
                'placeholder': 'Soil pH Level',
                'required': True
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*',
                'placeholder': 'Upload crop image'
            }),
            'image_ndvi': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*',
                'placeholder': 'Upload NDVI image (optional)'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make image fields optional
        self.fields['image'].required = False
        self.fields['image_ndvi'].required = False
        self.fields['farm_name'].required = True
        self.fields['farmer_name'].required = True

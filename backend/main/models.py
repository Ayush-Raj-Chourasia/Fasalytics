from django.db import models
import json

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    farm_size = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ContactMessage({self.name}, {self.email})"


class CropAnalysis(models.Model):
    """Store crop health analysis results"""
    STATUS_CHOICES = [
        ('healthy', 'Healthy'),
        ('stressed', 'Stressed'),
    ]
    
    # Sensor inputs (optional — image-only analyses may not have sensor data)
    soil_moisture = models.FloatField(default=0.0, help_text="Soil moisture percentage (0-100)")
    temperature = models.FloatField(default=0.0, help_text="Temperature in Celsius")
    humidity = models.FloatField(default=0.0, help_text="Humidity percentage (0-100)")
    leaf_wetness = models.FloatField(default=0.0, help_text="Leaf wetness (0-1)")
    ph_level = models.FloatField(default=0.0, help_text="Soil pH level")
    
    # Image upload (optional)
    image = models.ImageField(upload_to='crop_images/', null=True, blank=True)
    image_ndvi = models.FileField(upload_to='ndvi_images/', null=True, blank=True)
    
    # Prediction results
    prediction_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    confidence = models.FloatField(help_text="Confidence percentage (0-100)")
    
    # Recommendation
    recommendation = models.TextField()
    stress_reason = models.TextField(blank=True, null=True)
    
    # Zone map (stored as JSON)
    zone_map = models.JSONField(default=list, blank=True)
    
    # Metadata
    farm_name = models.CharField(max_length=255, blank=True, default='')
    crop_type = models.CharField(max_length=100, blank=True, default='')
    farmer_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analysis({self.farm_name}) - {self.prediction_status.upper()} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Crop Analyses"

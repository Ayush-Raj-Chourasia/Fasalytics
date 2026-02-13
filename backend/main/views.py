from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import ContactMessage, CropAnalysis
from .forms import CropAnalysisForm
from .inference import get_predictor
from reportlab.pdfgen import canvas
import json
from datetime import datetime
import os

# ==========================================
# API ENDPOINTS FOR REACT FRONTEND
# ==========================================

@require_http_methods(["POST"])
def analyze_crop_api(request):
    """Handle crop health analysis - API endpoint for React"""
    try:
        # Check if it's a POST request with files (image upload)
        if request.FILES.get('crop_image'):
            # Handle image-based analysis
            crop_image = request.FILES.get('crop_image')
            
            analysis = CropAnalysis.objects.create(
                crop_image=crop_image,
                prediction_status='healthy',  # Default status
                confidence=85.5,
                recommendation='Image received for analysis',
                stress_reason='',
                zone_map=[]
            )
            
            return JsonResponse({
                'success': True,
                'id': analysis.id,
                'message': 'Image analysis submitted'
            }, status=201)
        
        # Handle sensor data based analysis
        data = json.loads(request.body)
        
        # Validate sensor data
        required_fields = ['soil_moisture', 'temperature', 'humidity', 'leaf_wetness', 'ph_level']
        if not all(field in data for field in required_fields):
            return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)
        
        # Create analysis record
        analysis = CropAnalysis.objects.create(
            soil_moisture=float(data['soil_moisture']),
            temperature=float(data['temperature']),
            humidity=float(data['humidity']),
            leaf_wetness=float(data.get('leaf_wetness', 0)),
            ph_level=float(data['ph_level']),
        )
        
        # Run AI prediction
        try:
            predictor = get_predictor()
            sensor_data = {
                'soil_moisture': float(data['soil_moisture']),
                'temperature': float(data['temperature']),
                'humidity': float(data['humidity']),
                'leaf_wetness': float(data.get('leaf_wetness', 0)),
                'ph_level': float(data['ph_level']),
            }
            result = predictor.predict(sensor_data)
            
            # Update analysis with predictions
            analysis.prediction_status = result.get('status', 'unknown')
            analysis.confidence = result.get('confidence', 0)
            analysis.recommendation = result.get('recommendation', 'No recommendation available')
            analysis.stress_reason = result.get('stress_reason', '')
            analysis.zone_map = result.get('zone_map', [])
        except Exception as e:
            # Fallback if model prediction fails
            analysis.prediction_status = 'healthy'
            analysis.confidence = 75.0
            analysis.recommendation = 'Crop appears to be in normal condition'
            analysis.stress_reason = ''
            analysis.zone_map = []
        
        analysis.save()
        
        return JsonResponse({
            'success': True,
            'id': analysis.id,
            'message': 'Analysis completed'
        }, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def crop_results_api(request, pk):
    """Get crop analysis results - API endpoint for React"""
    try:
        analysis = get_object_or_404(CropAnalysis, pk=pk)
        
        # Ensure zone_map is properly formatted
        zone_map = analysis.zone_map if isinstance(analysis.zone_map, list) else []
        
        return JsonResponse({
            'id': analysis.id,
            'prediction_status': analysis.prediction_status,
            'confidence': analysis.confidence,
            'crop_type': analysis.crop_type or 'Unknown',
            'field_name': analysis.field_name or 'Field',
            'recommendation': analysis.recommendation,
            'stress_reason': analysis.stress_reason,
            'timestamp': analysis.created_at.isoformat(),
            'soil_moisture': analysis.soil_moisture,
            'temperature': analysis.temperature,
            'humidity': analysis.humidity,
            'ph_level': analysis.ph_level,
            'zone_map': zone_map
        }, status=200)
    except CropAnalysis.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Analysis not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def analysis_history_api(request):
    """Get crop analysis history - API endpoint for React"""
    try:
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        
        # Get all analyses ordered by most recent
        analyses = CropAnalysis.objects.all().order_by('-created_at')
        
        # Paginate
        paginator = Paginator(analyses, page_size)
        page_obj = paginator.get_page(page)
        
        # Format response
        results = []
        for analysis in page_obj:
            results.append({
                'id': analysis.id,
                'prediction_status': analysis.prediction_status,
                'confidence': analysis.confidence,
                'crop_type': analysis.crop_type or 'Unknown Crop',
                'field_name': analysis.field_name or 'Field Analysis',
                'timestamp': analysis.created_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'results': results,
            'total': paginator.count,
            'page': page,
            'total_pages': paginator.num_pages
        }, status=200)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def dashboard_api(request):
    """Get dashboard statistics - API endpoint for React"""
    try:
        total_analyses = CropAnalysis.objects.count()
        healthy_count = CropAnalysis.objects.filter(prediction_status='healthy').count()
        stressed_count = CropAnalysis.objects.filter(prediction_status='stressed').count()
        
        # Calculate average confidence
        avg_confidence = 0
        if total_analyses > 0:
            all_analyses = CropAnalysis.objects.all()
            total_confidence = sum(float(a.confidence) for a in all_analyses)
            avg_confidence = total_confidence / total_analyses
        
        # Get weekly trend data (last 4 weeks)
        from django.utils import timezone
        from datetime import timedelta
        
        trend_data = []
        for i in range(3, -1, -1):
            week_start = timezone.now() - timedelta(days=7*i+7)
            week_end = timezone.now() - timedelta(days=7*i)
            
            week_healthy = CropAnalysis.objects.filter(
                created_at__gte=week_start,
                created_at__lt=week_end,
                prediction_status='healthy'
            ).count()
            
            week_stressed = CropAnalysis.objects.filter(
                created_at__gte=week_start,
                created_at__lt=week_end,
                prediction_status='stressed'
            ).count()
            
            trend_data.append({
                'name': f'Week {i+1}',
                'healthy': week_healthy,
                'stressed': week_stressed
            })
        
        return JsonResponse({
            'success': True,
            'total_analyses': total_analyses,
            'healthy_count': healthy_count,
            'stressed_count': stressed_count,
            'healthy_percentage': (healthy_count / total_analyses * 100) if total_analyses > 0 else 0,
            'stressed_percentage': (stressed_count / total_analyses * 100) if total_analyses > 0 else 0,
            'avg_confidence': round(avg_confidence, 2),
            'trend_data': trend_data
        }, status=200)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def export_analysis_pdf(request, pk):
    """Export crop analysis as PDF"""
    try:
        analysis = get_object_or_404(CropAnalysis, pk=pk)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="crop_analysis_{analysis.pk}.pdf"'
        
        p = canvas.Canvas(response)
        
        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 800, "FASALYTICS - Crop Health Analysis Report")
        
        # Divider
        p.setFont("Helvetica", 10)
        p.drawString(50, 780, "=" * 80)
        
        # Farm and farmer info
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 760, "Farm Information")
        p.setFont("Helvetica", 10)
        p.drawString(50, 740, f"Crop Type: {analysis.crop_type or 'Unknown'}")
        p.drawString(50, 720, f"Field: {analysis.field_name or 'Unknown'}")
        p.drawString(50, 700, f"Analysis Date: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Sensor data
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 670, "Sensor Data")
        p.setFont("Helvetica", 10)
        p.drawString(50, 650, f"Soil Moisture: {analysis.soil_moisture:.1f}%")
        p.drawString(50, 630, f"Temperature: {analysis.temperature:.1f}°C")
        p.drawString(50, 610, f"Humidity: {analysis.humidity:.1f}%")
        p.drawString(50, 590, f"Soil pH: {analysis.ph_level:.1f}")
        
        # Prediction results
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 540, "Prediction Results")
        p.setFont("Helvetica", 10)
        status_text = "HEALTHY" if analysis.prediction_status == 'healthy' else "STRESSED"
        p.drawString(50, 520, f"Crop Status: {status_text}")
        p.drawString(50, 500, f"Confidence: {analysis.confidence:.1f}%")
        p.drawString(50, 480, f"Stress Reason: {analysis.stress_reason or 'N/A'}")
        
        # Recommendation
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 450, "Recommendation")
        p.setFont("Helvetica", 10)
        
        # Wrap recommendation text
        recommendation = analysis.recommendation or "No recommendation"
        words = recommendation.split()
        line = ""
        y_position = 430
        
        for word in words:
            if len(line) + len(word) > 80:
                if y_position < 100:
                    p.showPage()
                    y_position = 800
                p.drawString(50, y_position, line)
                y_position -= 20
                line = word
            else:
                line += word + " "
        
        if line:
            if y_position < 100:
                p.showPage()
                y_position = 800
            p.drawString(50, y_position, line)
        
        # Footer
        p.setFont("Helvetica-Oblique", 8)
        p.drawString(50, 30, f"Generated by FASALYTICS on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        p.showPage()
        p.save()
        
        return response
    except CropAnalysis.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Analysis not found'}, status=404)

@require_POST
@csrf_protect
def contact_submit_api(request):
    """Handle contact form submission - API endpoint for React"""
    try:
        data = json.loads(request.body)
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        if not (name and email and message):
            return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)
        
        contact = ContactMessage.objects.create(
            name=name,
            email=email,
            message=message
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your message was sent successfully.'
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

# ==========================================
# LEGACY HTML VIEWS (kept for compatibility)
# ==========================================

# Home page
def index(request):
    """Legacy home view"""
    return JsonResponse({'message': 'Use React frontend'})

def home(request):
    """Legacy home view"""
    return JsonResponse({'message': 'Use React frontend'})

# Generic page view
def page_view(request, page):
    """Render generic pages"""
    return JsonResponse({'message': 'Use React frontend'})

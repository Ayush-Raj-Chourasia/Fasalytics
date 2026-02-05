from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from .models import ContactMessage, CropAnalysis
from .forms import CropAnalysisForm
from .inference import get_predictor
from reportlab.pdfgen import canvas
import json
from datetime import datetime
import os

# Home page
def index(request):
    return render(request, 'index.html')

def home(request):
    return render(request, 'index.html')

# Input page for crop analysis
@require_http_methods(["GET", "POST"])
def analyze_crop(request):
    """Handle crop health analysis"""
    if request.method == 'POST':
        form = CropAnalysisForm(request.POST, request.FILES)
        if form.is_valid():
            # Get sensor data from form
            analysis = form.save(commit=False)
            
            # Prepare sensor data for model
            sensor_data = {
                'soil_moisture': analysis.soil_moisture,
                'temperature': analysis.temperature,
                'humidity': analysis.humidity,
                'leaf_wetness': analysis.leaf_wetness,
                'ph_level': analysis.ph_level,
            }
            
            # Run prediction
            predictor = get_predictor()
            result = predictor.predict(sensor_data)
            
            # Save analysis with results
            analysis.prediction_status = result['status']
            analysis.confidence = result['confidence']
            analysis.recommendation = result['recommendation']
            analysis.stress_reason = result['stress_reason']
            analysis.zone_map = result['zone_map']
            analysis.save()
            
            # Redirect to results page
            return redirect('crop_results', pk=analysis.pk)
    else:
        form = CropAnalysisForm()
    
    context = {
        'form': form,
        'page_title': 'Analyze Crop Health'
    }
    return render(request, 'analyze.html', context)

# Results page
def crop_results(request, pk):
    """Display crop analysis results"""
    analysis = get_object_or_404(CropAnalysis, pk=pk)
    
    context = {
        'analysis': analysis,
        'status_icon': '🟢' if analysis.prediction_status == 'healthy' else '🔴',
        'zone_map_json': json.dumps(analysis.zone_map) if analysis.zone_map else '[]',
    }
    return render(request, 'results.html', context)

# History page
def analysis_history(request):
    """Display past analyses"""
    analyses = CropAnalysis.objects.all()[:20]  # Get last 20 analyses
    
    context = {
        'analyses': analyses,
        'total_analyses': CropAnalysis.objects.count(),
    }
    return render(request, 'history.html', context)

# Dashboard page
def dashboard(request):
    """Dashboard with statistics"""
    total_analyses = CropAnalysis.objects.count()
    healthy_count = CropAnalysis.objects.filter(prediction_status='healthy').count()
    stressed_count = CropAnalysis.objects.filter(prediction_status='stressed').count()
    
    # Calculate average confidence
    avg_confidence = 0
    if total_analyses > 0:
        all_analyses = CropAnalysis.objects.all()
        total_confidence = sum(a.confidence for a in all_analyses)
        avg_confidence = total_confidence / total_analyses
    
    # Get recent analyses
    recent = CropAnalysis.objects.all().order_by('-created_at')[:10]
    
    context = {
        'total_analyses': total_analyses,
        'healthy_count': healthy_count,
        'stressed_count': stressed_count,
        'healthy_percentage': (healthy_count / total_analyses * 100) if total_analyses > 0 else 0,
        'stressed_percentage': (stressed_count / total_analyses * 100) if total_analyses > 0 else 0,
        'avg_confidence': avg_confidence,
        'recent_analyses': recent,
    }
    return render(request, 'dashboard.html', context)

# Export analysis as PDF
def export_analysis_pdf(request, pk):
    """Export crop analysis as PDF"""
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
    p.drawString(50, 740, f"Farm Name: {analysis.farm_name}")
    p.drawString(50, 720, f"Farmer Name: {analysis.farmer_name}")
    p.drawString(50, 700, f"Analysis Date: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Sensor data
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, 670, "Sensor Data")
    p.setFont("Helvetica", 10)
    p.drawString(50, 650, f"Soil Moisture: {analysis.soil_moisture:.1f}%")
    p.drawString(50, 630, f"Temperature: {analysis.temperature:.1f}°C")
    p.drawString(50, 610, f"Humidity: {analysis.humidity:.1f}%")
    p.drawString(50, 590, f"Leaf Wetness: {analysis.leaf_wetness:.2f}")
    p.drawString(50, 570, f"Soil pH: {analysis.ph_level:.1f}")
    
    # Prediction results
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, 540, "Prediction Results")
    p.setFont("Helvetica", 10)
    status_text = "HEALTHY" if analysis.prediction_status == 'healthy' else "STRESSED"
    p.drawString(50, 520, f"Crop Status: {status_text}")
    p.drawString(50, 500, f"Confidence: {analysis.confidence:.1f}%")
    p.drawString(50, 480, f"Stress Reason: {analysis.stress_reason}")
    
    # Recommendation
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, 450, "Recommendation")
    p.setFont("Helvetica", 10)
    
    # Wrap recommendation text
    recommendation_lines = analysis.recommendation.split(' | ')
    y_position = 430
    for line in recommendation_lines:
        if y_position < 100:
            p.showPage()
            y_position = 800
        p.drawString(50, y_position, f"• {line}")
        y_position -= 20
    
    # Footer
    p.setFont("Helvetica-Oblique", 8)
    p.drawString(50, 30, f"Generated by FASALYTICS on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    p.showPage()
    p.save()
    
    return response

# Contact form submission
@require_POST
@csrf_protect
def contact_submit(request):
    """Handle contact form submission"""
    name = request.POST.get('name', '').strip()
    email = request.POST.get('email', '').strip()
    farm_size = request.POST.get('farm_size', '').strip()
    message = request.POST.get('message', '').strip()

    if not (name and email and farm_size and message):
        return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)

    try:
        contact = ContactMessage.objects.create(
            name=name,
            email=email,
            farm_size=farm_size,
            message=message
        )
        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your message was sent successfully. We will contact you soon.'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'}, status=400)

# Export contact messages as PDF
def export_pdf(request):
    """Export all contact messages as PDF"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="contact_messages.pdf"'

    p = canvas.Canvas(response)
    p.drawString(100, 800, "Contact Messages Report")

    y = 760
    for msg in ContactMessage.objects.all():
        text = f"{msg.name} | {msg.email} | {msg.farm_size}"
        p.drawString(100, y, text)
        y -= 20
        
        if y < 100:
            p.showPage()
            y = 800

    p.showPage()
    p.save()
    return response

# Generic page view
def page_view(request, page):
    """Render generic pages"""
    template_name = f"{page}.html"
    from django.template.loader import get_template
    from django.http import Http404
    try:
        get_template(template_name)
        return render(request, template_name)
    except Exception:
        raise Http404("Page not found")
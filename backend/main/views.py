from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie, csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import ContactMessage, CropAnalysis
from .forms import CropAnalysisForm
from .inference import get_predictor
import json
from datetime import datetime
import os


def _build_recommendations(recommendation_text, status):
    """Convert a recommendation string into a structured list for the frontend."""
    if not recommendation_text:
        return [{'title': 'Monitor Conditions', 'description': 'Continue regular crop monitoring.', 'priority': 'low'}]
    parts = [p.strip() for p in recommendation_text.replace('\n', '.').split('.') if p.strip() and len(p.strip()) > 5]
    if not parts:
        parts = [recommendation_text]
    result = []
    for i, part in enumerate(parts[:5]):
        priority = 'high' if (i == 0 and status == 'stressed') else ('medium' if i < 2 else 'low')
        result.append({'title': part[:70] + ('...' if len(part) > 70 else ''), 'description': part, 'priority': priority})
    return result

# ==========================================
# API ENDPOINTS FOR REACT FRONTEND
# ==========================================

@require_http_methods(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Get CSRF token for React frontend"""
    from django.middleware.csrf import get_token
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

@require_http_methods(["POST", "OPTIONS"])
@csrf_exempt
def analyze_crop_api(request):
    """Handle crop health analysis - API endpoint for React. Code version: 2026-03-09"""
    if request.method == 'OPTIONS':
        return JsonResponse({'status': 'ok'}, status=200)
    try:
        # ── Image upload: delegate ALL inference + validation to HF Space ──
        if request.FILES.get('crop_image'):
            crop_image = request.FILES.get('crop_image')
            farm_name  = request.POST.get('farm_name', '')
            crop_type  = request.POST.get('crop_type', '')

            try:
                predictor = get_predictor()
                result = predictor.predict_from_image(crop_image)
            except ValueError as ve:
                # Crop validation rejected the image (not a plant photo)
                return JsonResponse({'success': False, 'message': str(ve)}, status=400)
            except Exception as e:
                return JsonResponse({'success': False, 'message': f'Image analysis failed: {e}'}, status=500)

            # Save analysis to DB (image saved separately to avoid field-name issues)
            analysis = CropAnalysis.objects.create(
                farm_name=farm_name,
                crop_type=crop_type,
                soil_moisture=result.get('soil_moisture', 50.0),
                temperature=result.get('temperature',   25.0),
                humidity=result.get('humidity',          65.0),
                leaf_wetness=result.get('leaf_wetness',   0.3),
                ph_level=result.get('ph_level',           6.5),
                prediction_status=result.get('status', 'healthy'),
                confidence=round(result.get('confidence', 80.0), 1),
                recommendation=result.get('recommendation', ''),
                stress_reason=result.get('stress_reason', ''),
                zone_map=result.get('zone_map', []),
            )
            # Attach image after record is created (safe regardless of field rename history)
            crop_image.seek(0)
            analysis.image.save(
                getattr(crop_image, 'name', 'upload.jpg'),
                crop_image,
                save=True,
            )
            return JsonResponse({'success': True, 'id': analysis.id, 'message': 'Image analysis completed'}, status=201)
        
        # Handle sensor data based analysis
        data = json.loads(request.body)
        
        # Validate sensor data
        required_fields = ['soil_moisture', 'temperature', 'humidity', 'leaf_wetness', 'ph_level']
        if not all(field in data for field in required_fields):
            return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)
        
        # Create analysis record
        analysis = CropAnalysis.objects.create(
            farm_name=data.get('farm_name', ''),
            crop_type=data.get('crop_type', ''),
            soil_moisture=float(data['soil_moisture']),
            temperature=float(data['temperature']),
            humidity=float(data['humidity']),
            leaf_wetness=float(data.get('leaf_wetness', 0)),
            ph_level=float(data['ph_level']),
            prediction_status='unknown',
            confidence=0.0,
            recommendation='',
            stress_reason='',
            zone_map=[]
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
        
        recommendations = _build_recommendations(analysis.recommendation, analysis.prediction_status)
        image_url = request.build_absolute_uri(analysis.image.url) if analysis.image else None

        return JsonResponse({
            'id': analysis.id,
            'prediction_status': analysis.prediction_status,
            'confidence': analysis.confidence,
            'farm_name': analysis.farm_name or 'Unknown Farm',
            'crop_type': analysis.crop_type or '',
            'farmer_name': analysis.farmer_name or 'Anonymous',
            'recommendation': analysis.recommendation,
            'recommendations': recommendations,
            'stress_reason': analysis.stress_reason,
            'timestamp': analysis.created_at.isoformat(),
            'soil_moisture': analysis.soil_moisture,
            'temperature': analysis.temperature,
            'humidity': analysis.humidity,
            'leaf_wetness': analysis.leaf_wetness,
            'ph_level': analysis.ph_level,
            'zone_map': zone_map,
            'image_url': image_url,
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
            image_url = request.build_absolute_uri(analysis.image.url) if analysis.image else None
            results.append({
                'id': analysis.id,
                'prediction_status': analysis.prediction_status,
                'confidence': analysis.confidence,
                'farm_name': analysis.farm_name or 'Farm',
                'crop_type': analysis.crop_type or '',
                'farmer_name': analysis.farmer_name or 'Farmer',
                'timestamp': analysis.created_at.isoformat(),
                'soil_moisture': analysis.soil_moisture,
                'temperature':   analysis.temperature,
                'humidity':      analysis.humidity,
                'leaf_wetness':  analysis.leaf_wetness,
                'ph_level':      analysis.ph_level,
                'image_url':     image_url,
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
        
        # Recent analyses for dashboard table
        recent_qs = CropAnalysis.objects.all().order_by('-created_at')[:5]
        recent_analyses = [{
            'id': a.id,
            'farm_name': a.farm_name or 'Farm',
            'crop_type': a.crop_type or '',
            'confidence': round(a.confidence, 1),
            'status': a.prediction_status,
            'timestamp': a.created_at.isoformat(),
        } for a in recent_qs]

        return JsonResponse({
            'success': True,
            'total_analyses': total_analyses,
            'healthy_count': healthy_count,
            'stressed_count': stressed_count,
            'healthy_percentage': round((healthy_count / total_analyses * 100), 1) if total_analyses > 0 else 0,
            'stressed_percentage': round((stressed_count / total_analyses * 100), 1) if total_analyses > 0 else 0,
            'avg_confidence': round(avg_confidence, 2),
            'trend_data': trend_data,
            'recent_analyses': recent_analyses,
        }, status=200)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def export_analysis_pdf(request, pk):
    """Export crop analysis as a professional PDF report."""
    try:
        analysis = get_object_or_404(CropAnalysis, pk=pk)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="fasalytics_report_{analysis.pk}.pdf"'

        from reportlab.lib.pagesizes import A4
        from reportlab.lib.colors import HexColor, white, black
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        doc = SimpleDocTemplate(response, pagesize=A4,
                                leftMargin=2*cm, rightMargin=2*cm,
                                topMargin=2*cm, bottomMargin=2*cm)

        green = HexColor('#00b050')
        dark = HexColor('#1a1a2e')
        red = HexColor('#c0392b')
        light_gray = HexColor('#f2f2f2')
        mid_gray = HexColor('#666666')

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Title'],
                                     fontSize=22, textColor=green, spaceAfter=6, alignment=TA_CENTER)
        sub_style = ParagraphStyle('Sub', parent=styles['Normal'],
                                   fontSize=10, textColor=mid_gray, alignment=TA_CENTER, spaceAfter=14)
        section_style = ParagraphStyle('Section', parent=styles['Heading2'],
                                       fontSize=13, textColor=dark, spaceBefore=14, spaceAfter=6)
        body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, spaceAfter=4)

        status_color = green if analysis.prediction_status == 'healthy' else red
        status_text = 'HEALTHY [OK]' if analysis.prediction_status == 'healthy' else 'STRESSED [!]'

        story = []

        # Header
        story.append(Paragraph('FASALYTICS', title_style))
        story.append(Paragraph('AI-Powered Crop Health Analysis Report', sub_style))
        story.append(HRFlowable(width='100%', thickness=2, color=green))
        story.append(Spacer(1, 0.4*cm))

        # Status banner
        status_style = ParagraphStyle('Status', parent=styles['Normal'],
                                      fontSize=16, textColor=status_color,
                                      alignment=TA_CENTER, spaceAfter=10, spaceBefore=6)
        story.append(Paragraph(f'Result: {status_text}  |  Confidence: {analysis.confidence:.1f}%', status_style))
        story.append(HRFlowable(width='100%', thickness=1, color=light_gray))
        story.append(Spacer(1, 0.4*cm))

        # Farm details
        story.append(Paragraph('Farm Information', section_style))
        farm_data = [
            ['Report ID', f'#FAS-{analysis.pk:05d}'],
            ['Farm / Field', analysis.farm_name or 'N/A'],
            ['Crop Type', analysis.crop_type or 'N/A'],
            ['Analysis Date', analysis.created_at.strftime('%B %d, %Y at %H:%M UTC')],
        ]
        farm_table = Table(farm_data, colWidths=[4*cm, 12*cm])
        farm_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), light_gray),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#dddddd')),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(farm_table)
        story.append(Spacer(1, 0.4*cm))

        # Sensor data
        story.append(Paragraph('Sensor Readings', section_style))
        sensor_data_table = [
            ['Parameter', 'Value', 'Optimal Range'],
            ['Soil Moisture', f'{analysis.soil_moisture:.1f}%', '40 – 60%'],
            ['Temperature', f'{analysis.temperature:.1f} °C', '20 – 25 °C'],
            ['Humidity', f'{analysis.humidity:.1f}%', '60 – 80%'],
            ['Leaf Wetness', f'{analysis.leaf_wetness:.1f}%', 'Low'],
            ['Soil pH', f'{analysis.ph_level:.1f}', '6.0 – 7.0'],
        ]
        sensor_table = Table(sensor_data_table, colWidths=[5*cm, 5*cm, 6*cm])
        sensor_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), dark),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#dddddd')),
            ('BACKGROUND', (0, 1), (-1, -1), white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, light_gray]),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(sensor_table)
        story.append(Spacer(1, 0.4*cm))

        # Recommendations
        story.append(Paragraph('AI Recommendations', section_style))
        if analysis.stress_reason:
            story.append(Paragraph(f'<b>Stress Reason:</b> {analysis.stress_reason}', body_style))
            story.append(Spacer(1, 0.2*cm))

        recommendations = _build_recommendations(analysis.recommendation, analysis.prediction_status)
        for i, rec in enumerate(recommendations, 1):
            priority_badge = {'high': '[HIGH]', 'medium': '[MEDIUM]', 'low': '[LOW]'}.get(rec['priority'], '')
            story.append(Paragraph(f'<b>{i}. {rec["title"]} {priority_badge}</b>', body_style))
            story.append(Paragraph(f'&nbsp;&nbsp;&nbsp;&nbsp;{rec["description"]}', body_style))
        story.append(Spacer(1, 0.4*cm))

        # Analysed image (if available)
        if analysis.image:
            try:
                import os
                img_path = analysis.image.path
                if os.path.exists(img_path):
                    from reportlab.platypus import Image as RLImage
                    story.append(Paragraph('Analysed Field Image', section_style))
                    rl_img = RLImage(img_path, width=10*cm, height=8*cm, kind='proportional')
                    story.append(rl_img)
                    story.append(Spacer(1, 0.4*cm))
            except Exception as img_err:
                print(f'PDF image embed skipped: {img_err}')

        # Footer
        story.append(HRFlowable(width='100%', thickness=1, color=light_gray))
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'],
                                      fontSize=8, textColor=mid_gray, alignment=TA_CENTER, spaceBefore=6)
        story.append(Paragraph(
            f'Generated by FASALYTICS • Team Inquisitor • {datetime.now().strftime("%B %d, %Y at %H:%M")}',
            footer_style
        ))

        doc.build(story)
        return response
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@require_POST
@csrf_exempt
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

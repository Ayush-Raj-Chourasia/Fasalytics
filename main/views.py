from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from .models import ContactMessage
from reportlab.pdfgen import canvas
from django.http import HttpResponse

def index(request):
    return render(request, 'index.html')

def input_page(request):
    return render(request, 'input.html')
def home(request):
    return render(request, 'index.html')

def page_view(request, page):
    template_name = f"{page}.html"
    from django.template.loader import get_template
    from django.http import Http404
    try:
        get_template(template_name)
        return render(request, template_name)
    except Exception:
        raise Http404("Page not found")

@require_POST
@csrf_protect
def contact_submit(request):
    name = request.POST.get('name', '').strip()
    email = request.POST.get('email', '').strip()
    farm_size = request.POST.get('farm_size', '').strip()
    message = request.POST.get('message', '').strip()

    if not (name and email and farm_size and message):
        return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)

    return JsonResponse({'success': True, 'message': 'Thank you! Your message was sent.'})
    print("POST DATA:", request.POST)



# function to generate a PDF 
def export_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="report.pdf"'

    p = canvas.Canvas(response)
    p.drawString(100, 800, "Contact Messages Report")

    y = 760
    for msg in ContactMessage.objects.all():
        text = f"{msg.name} | {msg.email} | {msg.farm_size} | {msg.message}"
        p.drawString(100, y, text)
        y -= 20

    p.showPage()
    p.save()
    return response
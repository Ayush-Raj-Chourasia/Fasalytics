from django.urls import path
from . import views

urlpatterns = [
    # Home
    path('', views.index, name='home'),
    path('home/', views.home, name='home_page'),
    
    # Crop Analysis
    path('analyze/', views.analyze_crop, name='analyze_crop'),
    path('results/<int:pk>/', views.crop_results, name='crop_results'),
    path('history/', views.analysis_history, name='analysis_history'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('export/pdf/<int:pk>/', views.export_analysis_pdf, name='export_analysis_pdf'),
    
    # Contact
    path('contact/submit/', views.contact_submit, name='contact_submit'),
    path('export/pdf/', views.export_pdf, name='export_pdf'),
    
    # Generic pages
    path('page/<str:page>/', views.page_view, name='page'),
]

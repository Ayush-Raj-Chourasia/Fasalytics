from django.urls import path
from . import views

urlpatterns = [
    # Home
    path('', views.index, name='home'),
    path('home/', views.home, name='home_page'),
    
    # CSRF Token endpoint
    path('api/csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    
    # Version diagnostic endpoint
    path('api/version/', views.version_api, name='version_api'),
    
    # API Endpoints for React Frontend
    path('api/analyze/', views.analyze_crop_api, name='analyze_crop_api'),
    path('api/results/<int:pk>/', views.crop_results_api, name='crop_results_api'),
    path('api/history/', views.analysis_history_api, name='analysis_history_api'),
    path('api/dashboard/', views.dashboard_api, name='dashboard_api'),
    path('api/export/pdf/<int:pk>/', views.export_analysis_pdf, name='export_analysis_pdf_api'),
    path('api/contact/submit/', views.contact_submit_api, name='contact_submit_api'),
    
    # Generic pages
    path('page/<str:page>/', views.page_view, name='page'),
]


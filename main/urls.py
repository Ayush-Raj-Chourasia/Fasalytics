from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('contact/submit/', views.contact_submit, name='contact_submit'),  
    path('export/pdf/', views.export_pdf, name='export_pdf'),
    path('input/', views.input_page, name='input_page'),
]

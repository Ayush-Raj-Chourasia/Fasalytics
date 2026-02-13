from django.contrib import admin
from .models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'farm_size', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'message')

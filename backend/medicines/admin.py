from django.contrib import admin
from .models import Medicine

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'dosage', 'frequency', 'user', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
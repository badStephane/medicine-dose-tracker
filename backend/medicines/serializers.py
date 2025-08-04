from rest_framework import serializers
from .models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'dosage', 'frequency', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Medicine name cannot be empty.")
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Medicine name is too long (max 100 characters).")
        return value.strip()

    def validate_dosage(self, value):
        if not value.strip():
            raise serializers.ValidationError("Dosage cannot be empty.")
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Dosage is too long (max 100 characters).")
        return value.strip()

    def validate_frequency(self, value):
        if not value.strip():
            raise serializers.ValidationError("Frequency cannot be empty.")
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Frequency is too long (max 100 characters).")
        return value.strip()

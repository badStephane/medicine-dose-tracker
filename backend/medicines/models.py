from django.db import models
from django.conf import settings

class Medicine(models.Model):
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medicines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.user.username}"
from django.urls import path
from . import views

urlpatterns = [
    path('', views.medicine_list, name='medicine-list'),
    path('<int:pk>/', views.medicine_detail, name='medicine-detail'),
]
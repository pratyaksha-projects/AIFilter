from django.urls import path
from .views import detect_ai

urlpatterns = [
    path('detect/', detect_ai),
]
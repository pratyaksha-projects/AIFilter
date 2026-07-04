from django.urls import path
from .views import detect_ai, detect_ai_image

urlpatterns = [
    path('detect/', detect_ai),
    path('detect-image/', detect_ai_image),
]
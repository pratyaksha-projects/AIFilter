
# detection logic # api endpoints 
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .analyzer import analyze_content

# Create your views here.

@api_view(['POST']) # wll handle api logic 

def detect_ai(request):
    text = request.data.get("text", "")
    result = analyze_content(text)
    return Response(result)
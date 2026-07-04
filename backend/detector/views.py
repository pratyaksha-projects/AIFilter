
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

from .image_analyzer import analyze_image_url

@api_view(['POST'])
def detect_ai_image(request):
    image_url = request.data.get("image_url", "")
    if not image_url:
        return Response({"error": "no image_url provided"})
    result = analyze_image_url(image_url)
    return Response(result)
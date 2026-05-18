from django.shortcuts import render

# detection logic
from rest_framework.decorators import api_view
from rest_framework.response import Response


# Create your views here.

@api_view(['POST'])

def detect_ai(request):

    text = request.data.get("text", "")

    text_length = len(text)

    if text_length > 1000:

        probability = 78
        result = "Likely AI Generated"

    else:

        probability = 22
        result = "Likely Human Written"

    return Response({

        "ai_probability": probability,

        "result": result
    })
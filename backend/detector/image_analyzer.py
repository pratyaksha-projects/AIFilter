from transformers import pipeline
from PIL import Image
import requests
from io import BytesIO

# Model sirf ek baar load hoga jab server start hota hai
detector = pipeline("image-classification", model="umm-maybe/AI-image-detector")

def analyze_image_url(image_url):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(image_url, headers=headers, timeout=5)

        img = Image.open(BytesIO(response.content)).convert("RGB")
        results = detector(img)
        # print(results)  # debug ke liye — pehli baar exact labels dekhne ke liye kiya hmne

        ai_score = 0
        for r in results:
            if r['label'].lower() in ['artificial', 'ai', 'fake']:
                ai_score = round(r['score'] * 100)

        return {"image_ai_probability": ai_score}

    except Exception as e:
        return {"image_ai_probability": 0, "error": str(e)}


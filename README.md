# AIFilter

AIFilter is a browser-based AI content analysis system that analyzes webpage text and estimates how AI-like the content appears to be.

## Problem

AI-generated content is increasing rapidly and becoming more difficult to identify as models continue improving. 
Sometimes it becomes hard to realize whether content is human-written or AI-generated.

## Why I Built This

I built AIFilter to help users understand how AI-like the content they are viewing appears to be.
My long-term goal is to give users more control over their feed by allowing them to detect, reduce, or filter AI-heavy content on platforms such as YouTube, Instagram, and other platforms.

I also want to explore features where users can decide how much AI-generated content they want in their feed.

## Features

- Real-time webpage scanning
- AI probability scoring
- Browser extension integration
- Multi-signal content analysis
- Color-coded result interface

## Current Detection Signals

- AI-style phrases
- Sentence uniformity
- Vocabulary diversity
- Long polished text patterns
- Burstiness variations

Currently scans approximately the first 5000 characters of webpage text.

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework

### Frontend
- JavaScript
- HTML
- CSS
- Edge/Chromium Extension APIs

## How It Works

```text
Browser Extension
        ↓
Django Backend
        ↓
Analysis Engine
        ↓
AI Probability Score
        ↓
Result in Extension
```

## Screenshots

### Extension Result
![Extension Result](docs/screenshots/ai-analysis-engine/extension-result.png)

### Extension Demo
![Extension Demo](docs/screenshots/ai-analysis-engine/extension-demo.png)

### API Testing
![API Testing](docs/screenshots/ai-analysis-engine/api-testing.png)

## Future Improvements

- YouTube content filtering
- AI-content hiding
- User sensitivity controls
- Deepfake/media detection
- Public deployment

## How To Run

### Backend

```bash
pip install -r requirements.txt
python manage.py runserver
```

### Extension

1. Open Edge/Chrome extensions
2. Enable Developer Mode
3. Click Load Unpacked
4. Select extension folder

## License

MIT License

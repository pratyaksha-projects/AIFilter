#scoring engine
from .ai_rules import AI_PHRASES
from .utils import clean_text, split_sentences


def analyze_content(text):
    text = clean_text(text) # clean and normalize the text 
    score = 0
    matched_phrases = [] # ai-like phrases

    # AI phrase detection
    for phrase in AI_PHRASES:
        if phrase in text:
            score += 10
            matched_phrases.append(phrase)

    # Text length factor : long -> ai prone
    score += min(len(text) // 500, 25)

    # Sentence uniformity check : balanced -> ai prone
    sentences = split_sentences(text)
    lengths = [
        len(sentence.split())
        for sentence in sentences
        if sentence.strip()
    ]
    if lengths:
        avg = sum(lengths) / len(lengths)
        variance = sum(
            abs(x - avg)
            for x in lengths
        ) / len(lengths)
        if variance < 5: # low -> ai-prone
            score += 20
    words = text.split()
    unique_words = set(words)

    if len(words) > 0:
        diversity = len(unique_words) / len(words)

        # low diversity may indicate repetitive ai-style writing
        if diversity < 0.45:
            score += 15

    # Final probability

    probability = min(score, 100)

    # classification system

    if probability >= 70:
        result = "Highly AI-Likely"
    elif probability >= 40:
        result = "Possibly AI-Generated"
    else:
        result = "Likely Human-Written"

    # final response returned to frontend
    return {
        "ai_probability": probability,
        "result": result,
        "matched_phrases": matched_phrases
    }
 # now it is detecting ai-style transitions , overly formal structure and sentence uniformity plus long polished test patterns ...


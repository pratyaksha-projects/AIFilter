# helper functions here: 

import re
 # did text preprocessing,
def clean_text(text):
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_sentences(text):
    return re.split(r'[.!?]+', text)
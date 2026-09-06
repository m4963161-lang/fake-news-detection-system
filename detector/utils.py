"""
NLP & Preprocessing Utilities for Django Detector App.
"""

import re
import string
import math
from typing import Dict, List, Any

STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
    "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
    'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it',
    "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
    'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
    'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
}

# Strong indicator vocabulary
INDICATOR_KEYWORDS = [
    {'word': 'miracle', 'bias': 'FAKE', 'weight': 3.2},
    {'word': 'cure', 'bias': 'FAKE', 'weight': 2.8},
    {'word': 'secret', 'bias': 'FAKE', 'weight': 2.4},
    {'word': 'shocking', 'bias': 'FAKE', 'weight': 3.0},
    {'word': 'banned', 'bias': 'FAKE', 'weight': 2.9},
    {'word': 'conspiracy', 'bias': 'FAKE', 'weight': 3.5},
    {'word': 'exposed', 'bias': 'FAKE', 'weight': 2.7},
    {'word': 'aliens', 'bias': 'FAKE', 'weight': 3.8},
    {'word': 'urgent', 'bias': 'FAKE', 'weight': 2.2},
    {'word': 'mind control', 'bias': 'FAKE', 'weight': 3.6},
    {'word': 'coverup', 'bias': 'FAKE', 'weight': 3.3},
    {'word': 'reuters', 'bias': 'REAL', 'weight': 3.5},
    {'word': 'spokesperson', 'bias': 'REAL', 'weight': 3.0},
    {'word': 'confirmed', 'bias': 'REAL', 'weight': 2.5},
    {'word': 'official', 'bias': 'REAL', 'weight': 2.8},
    {'word': 'announced', 'bias': 'REAL', 'weight': 2.4},
    {'word': 'statement', 'bias': 'REAL', 'weight': 2.2},
    {'word': 'department', 'bias': 'REAL', 'weight': 2.6},
    {'word': 'conference', 'bias': 'REAL', 'weight': 2.3},
    {'word': 'study', 'bias': 'REAL', 'weight': 2.9},
    {'word': 'published', 'bias': 'REAL', 'weight': 2.7},
    {'word': 'peer-reviewed', 'bias': 'REAL', 'weight': 3.4},
]

def clean_text(text: str) -> str:
    """Cleans raw news text for TF-IDF vectorization."""
    if not isinstance(text, str) or not text.strip():
        return ""
    cleaned = text.lower().strip()
    cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', cleaned)
    cleaned = re.sub(r'<.*?>', ' ', cleaned)
    cleaned = re.sub(r'[' + re.escape(string.punctuation) + r'—–“”‘’]', ' ', cleaned)
    cleaned = re.sub(r'\b\d+\b', ' ', cleaned)
    tokens = [w for w in cleaned.split() if w not in STOPWORDS and len(w) > 1]
    return ' '.join(tokens)


def get_token_breakdown(raw_text: str) -> Dict[str, Any]:
    """Computes NLP token analytics, sensationalism index, and detected keywords."""
    if not raw_text:
        return {
            'total_characters': 0,
            'total_words': 0,
            'vocabulary_density': 0,
            'uppercase_ratio': 0,
            'sensationalism_score': 0,
            'key_terms': []
        }

    words = raw_text.split()
    total_words = len(words)
    total_chars = len(raw_text)

    cleaned = clean_text(raw_text)
    cleaned_tokens = cleaned.split()
    unique_tokens = set(cleaned_tokens)
    vocab_density = round((len(unique_tokens) / max(1, len(cleaned_tokens))) * 100, 1)

    letters = [c for c in raw_text if c.isalpha()]
    caps = [c for c in letters if c.isupper()]
    uppercase_ratio = round((len(caps) / max(1, len(letters))) * 100, 1)

    exclamation_count = raw_text.count('!')
    detected_terms = []
    lower_text = raw_text.lower()
    for item in INDICATOR_KEYWORDS:
        if item['word'] in lower_text:
            detected_terms.append(item)

    fake_triggers = sum(1 for t in detected_terms if t['bias'] == 'FAKE')
    sensationalism = min(100, int((exclamation_count * 12) + (uppercase_ratio * 0.7) + (fake_triggers * 20)))

    return {
        'total_characters': total_chars,
        'total_words': total_words,
        'vocabulary_density': vocab_density,
        'uppercase_ratio': uppercase_ratio,
        'sensationalism_score': sensationalism,
        'key_terms': detected_terms
    }

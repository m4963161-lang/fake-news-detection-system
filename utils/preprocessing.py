"""
Natural Language Processing (NLP) Preprocessing Utility Module
Fake News Detection System

This module handles text cleaning, normalization, stopword removal,
tokenization, and prepares raw text for TF-IDF feature extraction.
"""

import re
import string

# Standard English stopwords fallback list for resilience
DEFAULT_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've",
    "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a',
    'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on',
    'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've",
    'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn',
    "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn',
    "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn',
    "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn',
    "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
}

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    try:
        STOPWORDS = set(stopwords.words('english'))
    except (LookupError, AttributeError):
        try:
            nltk.download('stopwords', quiet=True)
            nltk.download('punkt', quiet=True)
            STOPWORDS = set(stopwords.words('english'))
        except Exception:
            STOPWORDS = DEFAULT_STOPWORDS
except ImportError:
    STOPWORDS = DEFAULT_STOPWORDS


def clean_text(text: str, remove_stops: bool = True) -> str:
    """
    Cleans raw news headline or article text using standard NLP pipeline:
    1. Converts text to lowercase
    2. Strips URL links (http/https/ftp/www)
    3. Strips HTML markup tags and entities
    4. Removes punctuation marks and non-alphanumeric characters
    5. Strips isolated digits and excessive symbols
    6. Removes English stopwords
    7. Normalizes whitespace and returns cleaned single string
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # 1. Lowercase
    cleaned = text.lower().strip()

    # 2. Remove URLs
    cleaned = re.sub(r'https?://\S+|www\.\S+|ftp://\S+', ' ', cleaned)

    # 3. Remove HTML tags and entities
    cleaned = re.sub(r'<.*?>', ' ', cleaned)
    cleaned = re.sub(r'&[a-z0-9]+;', ' ', cleaned)

    # 4. Remove punctuation & special characters
    cleaned = re.sub(r'[' + re.escape(string.punctuation) + r'—–“”‘’…«»]', ' ', cleaned)

    # 5. Remove standalone digits and special symbols
    cleaned = re.sub(r'\b\d+\b', ' ', cleaned)
    cleaned = re.sub(r'[^\w\s]', ' ', cleaned)

    # 6. Tokenize & Remove stopwords
    tokens = cleaned.split()
    if remove_stops:
        tokens = [word for word in tokens if word not in STOPWORDS and len(word) > 1]

    # 7. Normalize whitespace
    return ' '.join(tokens)


def get_token_breakdown(text: str) -> dict:
    """
    Returns step-by-step diagnostic breakdown of NLP preprocessing
    for visualization in the dashboard UI.
    """
    raw_length = len(text)
    raw_word_count = len(text.split())
    cleaned = clean_text(text, remove_stops=True)
    cleaned_tokens = cleaned.split()
    removed_words = [w.lower() for w in text.split() if w.lower() in STOPWORDS]

    return {
        "raw_character_count": raw_length,
        "raw_word_count": raw_word_count,
        "processed_character_count": len(cleaned),
        "processed_word_count": len(cleaned_tokens),
        "cleaned_text": cleaned,
        "tokens": cleaned_tokens,
        "removed_stopwords_count": len(removed_words),
        "vocabulary_sample": list(set(cleaned_tokens))[:15]
    }

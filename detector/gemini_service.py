"""
Gemini AI service for Fake News Detection System.

Gemini is used as a supporting forensic-analysis layer.
The primary REAL/FAKE classification remains the Scikit-learn model.
"""

import json
import logging

from django.conf import settings
from google import genai

logger = logging.getLogger(__name__)


def analyze_news_with_gemini(
    news_text: str,
    ml_prediction: str,
    ml_confidence: float,
    prob_real: float,
    prob_fake: float,
    sensationalism_score: int,
):
    """
    Uses Gemini to generate a supporting forensic analysis.

    Gemini does NOT replace the Scikit-learn classifier.
    """

    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not configured.")

        return {
            "success": False,
            "summary": "Gemini AI analysis is not configured.",
            "key_claims": [],
            "red_flags": [],
            "reasoning": "",
            "verification_advice": "",
        }

    try:
        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        prompt = f"""
You are an AI forensic news-analysis assistant.

Analyze the following news text as a supporting analyst.

IMPORTANT:
- Do NOT blindly agree with the machine-learning prediction.
- Do NOT claim that an article is factually verified unless the supplied
  information supports that conclusion.
- Separate suspicious writing patterns from factual verification.
- The Scikit-learn model is the primary classifier.
- Gemini provides an explanation and risk analysis.
- Identify claims that should be independently verified.
- Avoid inventing sources, quotations, statistics, people, or events.

MACHINE-LEARNING RESULT:
Prediction: {ml_prediction}
Confidence: {ml_confidence}%
Probability Real: {prob_real}%
Probability Fake: {prob_fake}%
Sensationalism Score: {sensationalism_score}/100

NEWS TEXT:
{news_text}

Return ONLY valid JSON in exactly this structure:

{{
    "summary": "Short overall forensic assessment",
    "key_claims": [
        "Important claim requiring verification"
    ],
    "red_flags": [
        "Suspicious characteristic or warning sign"
    ],
    "reasoning": "Explain how the article's language, claims,
                    structure, and evidence affect the assessment.",
    "verification_advice": "Explain what a reader should verify
                            before trusting the article."
}}

Do not use Markdown.
Do not put JSON inside code fences.
"""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )

        raw_text = (response.text or "").strip()

        if not raw_text:
            raise ValueError("Gemini returned an empty response.")

        # Remove accidental Markdown code fences.
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]

        if raw_text.startswith("```"):
            raw_text = raw_text[3:]

        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        raw_text = raw_text.strip()

        analysis = json.loads(raw_text)

        return {
            "success": True,
            "summary": analysis.get("summary", ""),
            "key_claims": analysis.get("key_claims", []),
            "red_flags": analysis.get("red_flags", []),
            "reasoning": analysis.get("reasoning", ""),
            "verification_advice": analysis.get(
                "verification_advice",
                ""
            ),
        }

    except Exception as exc:
        logger.exception(
            "Gemini forensic analysis failed: %s",
            exc,
        )

        return {
            "success": False,
            "summary": "Gemini analysis could not be completed.",
            "key_claims": [],
            "red_flags": [],
            "reasoning": "",
            "verification_advice": "",
        }
"""
Django Forms for Fake News Detection System.
Enforces text validation, length constraints, and anti-abuse checks.
"""

from django import forms
from django.core.exceptions import ValidationError
from .models import Prediction, Feedback

class NewsAnalysisForm(forms.ModelForm):
    """
    Form for validating news article submission.
    """
    class Meta:
        model = Prediction
        fields = ['news_text']
        widgets = {
            'news_text': forms.Textarea(attrs={
                'class': 'form-control font-sans',
                'rows': 6,
                'placeholder': 'Paste a full news story, paragraph, press release, or headline here for ML forensic analysis (minimum 20 characters)...',
                'id': 'news_text_input',
            })
        }
        labels = {
            'news_text': 'News Content / Article Body'
        }

    def clean_news_text(self):
        text = self.cleaned_data.get('news_text', '').strip()
        if not text:
            raise ValidationError("Please provide a news headline or article.")
        if len(text) < 20:
            raise ValidationError("News input is too short. Please provide at least 20 characters for meaningful NLP evaluation.")
        if len(text) > 5000:
            raise ValidationError("Input exceeds the maximum allowed length of 5,000 characters.")
        return text


class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = ['user_verdict', 'comments']
        widgets = {
            'user_verdict': forms.Select(attrs={'class': 'form-select'}),
            'comments': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Optional notes on why you agree/disagree...'}),
        }

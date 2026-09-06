"""
Django Models for Fake News Detection System.
Implements persistent storage using Django ORM and SQLite backend.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

class Prediction(models.Model):
    """
    Stores each verified news query, model verdict, confidence, and metadata.
    """
    VERDICT_CHOICES = [
        ('REAL', 'Real News'),
        ('FAKE', 'Fake News'),
    ]

    news_text = models.TextField(
        verbose_name=_("News Text / Headline"),
        help_text=_("The original news headline or article body submitted for verification.")
    )
    prediction = models.CharField(
        max_length=10,
        choices=VERDICT_CHOICES,
        verbose_name=_("Prediction Verdict"),
        help_text=_("Classification verdict: REAL or FAKE.")
    )
    confidence = models.FloatField(
        verbose_name=_("Confidence Score (%)"),
        help_text=_("Probability confidence percentage calculated by the classifier (50.0 - 99.9%).")
    )
    prob_real = models.FloatField(
        default=0.0,
        verbose_name=_("Real Probability (%)")
    )
    prob_fake = models.FloatField(
        default=0.0,
        verbose_name=_("Fake Probability (%)")
    )
    sensationalism_score = models.IntegerField(
        default=0,
        verbose_name=_("Sensationalism Score (0-100)")
    )
    user_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("Submitted By User")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Analysis Timestamp")
    )

    class Meta:
        verbose_name = _("News Prediction")
        verbose_name_plural = _("News Predictions")
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.prediction}] #{self.id} ({self.confidence:.1f}%) - {self.snippet}"

    @property
    def snippet(self):
        """Returns the first 65 characters of the article text."""
        if len(self.news_text) > 65:
            return self.news_text[:65] + "..."
        return self.news_text

    @property
    def is_fake(self):
        return self.prediction == 'FAKE'

    @property
    def is_real(self):
        return self.prediction == 'REAL'


class AuditLog(models.Model):
    """
    Records administrative actions, prediction clearances, and security audits.
    """
    action = models.CharField(max_length=100)
    details = models.TextField(blank=True)
    user_email = models.EmailField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


class Feedback(models.Model):
    """
    User verification feedback on model prediction accuracy.
    """
    FEEDBACK_CHOICES = [
        ('AGREE', 'Agree with Model Verdict'),
        ('DISAGREE', 'Disagree / Reported as Error'),
    ]

    prediction = models.ForeignKey(
        Prediction,
        on_delete=models.CASCADE,
        related_name='feedbacks'
    )
    user_verdict = models.CharField(max_length=15, choices=FEEDBACK_CHOICES)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Prediction Feedback")
        verbose_name_plural = _("Prediction Feedbacks")

    def __str__(self):
        return f"Feedback on #{self.prediction_id}: {self.user_verdict}"


class RecentNewsArticle(models.Model):
    """
    Stores newly ingested recent breaking news articles for continuous auto-learning.
    """
    title = models.CharField(max_length=300, verbose_name=_("Article Title / Headline"))
    content = models.TextField(verbose_name=_("Article Body Text"))
    source = models.CharField(max_length=150, default="Live Wire", verbose_name=_("News Source"))
    category = models.CharField(max_length=100, default="General", verbose_name=_("Topic Category"))
    suggested_label = models.CharField(max_length=10, choices=Prediction.VERDICT_CHOICES, default='REAL')
    verified_label = models.CharField(max_length=10, choices=Prediction.VERDICT_CHOICES, blank=True, null=True)
    confidence = models.FloatField(default=0.0)
    is_learned = models.BooleanField(default=False, verbose_name=_("Absorbed into ML Model"))
    learned_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Learning Timestamp"))
    extracted_ngrams = models.TextField(blank=True, help_text=_("Comma-separated salient n-grams extracted from text"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Recent News Article")
        verbose_name_plural = _("Recent News Articles")
        ordering = ['-created_at']

    def __str__(self):
        status = "LEARNED" if self.is_learned else "PENDING"
        return f"[{status}] {self.title[:50]}..."


class ActiveLearningSession(models.Model):
    """
    Audit log for automated retraining iterations and online model weight updates.
    """
    session_id = models.CharField(max_length=64, unique=True)
    model_version = models.CharField(max_length=50)
    accuracy_before = models.FloatField()
    accuracy_after = models.FloatField()
    new_vocabulary_count = models.IntegerField(default=0)
    articles_ingested = models.IntegerField(default=1)
    trigger_type = models.CharField(max_length=50, default="auto_stream")
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Active Learning Session")
        verbose_name_plural = _("Active Learning Sessions")
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.model_version} at {self.timestamp.strftime('%Y-%m-%d %H:%M')} (Acc: {self.accuracy_after}%)"


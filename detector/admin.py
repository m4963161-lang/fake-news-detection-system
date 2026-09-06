"""
Django Admin Configuration for Fake News Detection System.
Provides a comprehensive administrative panel for managing verified records and logs.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Prediction, AuditLog, Feedback, RecentNewsArticle, ActiveLearningSession

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('id', 'verdict_badge', 'confidence_display', 'snippet', 'user_email', 'created_at')
    list_filter = ('prediction', 'created_at')
    search_fields = ('news_text', 'user_email')
    readonly_fields = ('created_at', 'prob_real', 'prob_fake', 'sensationalism_score')
    date_hierarchy = 'created_at'
    list_per_page = 25

    def verdict_badge(self, obj):
        if obj.prediction == 'REAL':
            return format_html(
                '<span style="background-color: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">✓ REAL</span>'
            )
        return format_html(
            '<span style="background-color: #ffe4e6; color: #9f1239; padding: 3px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">⚠ FAKE</span>'
        )
    verdict_badge.short_description = "Verdict"

    def confidence_display(self, obj):
        color = "#059669" if obj.prediction == 'REAL' else "#e11d48"
        return format_html(
            f'<strong style="color: {color}; font-family: monospace;">{obj.confidence:.2f}%</strong>'
        )
    confidence_display.short_description = "Confidence"


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'user_email', 'ip_address', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('action', 'details', 'user_email')
    readonly_fields = ('timestamp',)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'prediction', 'user_verdict', 'created_at')
    list_filter = ('user_verdict', 'created_at')
    search_fields = ('comments', 'prediction__news_text')


@admin.register(RecentNewsArticle)
class RecentNewsArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title_snippet', 'category', 'source', 'learning_status_badge', 'suggested_label', 'confidence', 'created_at')
    list_filter = ('is_learned', 'category', 'suggested_label', 'created_at')
    search_fields = ('title', 'content', 'source')
    actions = ['mark_for_retraining']

    def title_snippet(self, obj):
        return obj.title[:50] + "..." if len(obj.title) > 50 else obj.title
    title_snippet.short_description = "Headline"

    def learning_status_badge(self, obj):
        if obj.is_learned:
            return format_html('<span style="background:#d1fae5; color:#065f46; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:bold;">✓ LEARNED</span>')
        return format_html('<span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:bold;">⏳ PENDING</span>')
    learning_status_badge.short_description = "Status"

    @admin.action(description="Trigger immediate auto-learning on selected articles")
    def mark_for_retraining(self, request, queryset):
        from django.core.management import call_command
        call_command('auto_learn', batch_size=1)
        self.message_user(request, "Auto-learning retraining cycle executed successfully!")


@admin.register(ActiveLearningSession)
class ActiveLearningSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'model_version', 'articles_ingested', 'accuracy_before', 'accuracy_after', 'trigger_type', 'timestamp')
    list_filter = ('trigger_type', 'timestamp')
    readonly_fields = ('session_id', 'model_version', 'accuracy_before', 'accuracy_after', 'articles_ingested', 'trigger_type', 'details', 'timestamp')


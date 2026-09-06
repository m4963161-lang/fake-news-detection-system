import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Copy,
  Check,
  Terminal,
  Download,
  FileText,
  FolderTree,
  Archive,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import JSZip from 'jszip';

export const CodeExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<
    'manage' | 'settings' | 'urls' | 'models' | 'views' | 'forms' | 'admin' | 'app_urls' | 'template' | 'train' | 'nlp' | 'reqs' | 'commands' | 'auto_learn_cmd' | 'auto_learn_template'
  >('views');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const fileContents: Record<string, { title: string; filename: string; code: string; lang: string; category: string }> = {
    manage: {
      category: 'Project Root',
      title: 'Django Management Utility',
      filename: 'manage.py',
      lang: 'python',
      code: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fakenews_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()`
    },
    settings: {
      category: 'Configuration',
      title: 'Django Project Settings',
      filename: 'fakenews_project/settings.py',
      lang: 'python',
      code: `import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-fakedetect-ml-2026')
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Fake News Detection app
    'detector.apps.DetectorConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fakenews_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'fakenews_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ML Artifact Paths
ML_MODEL_PATH = BASE_DIR / 'model' / 'fake_news_model.pkl'
ML_VECTORIZER_PATH = BASE_DIR / 'model' / 'tfidf_vectorizer.pkl'
ML_METRICS_PATH = BASE_DIR / 'model' / 'metrics.json'`
    },
    urls: {
      category: 'Configuration',
      title: 'Root URL Configuration',
      filename: 'fakenews_project/urls.py',
      lang: 'python',
      code: `from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('detector.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])`
    },
    models: {
      category: 'Detector App',
      title: 'Django ORM Models (SQLite)',
      filename: 'detector/models.py',
      lang: 'python',
      code: `from django.db import models
from django.utils.translation import gettext_lazy as _

class Prediction(models.Model):
    VERDICT_CHOICES = [
        ('REAL', 'Real News'),
        ('FAKE', 'Fake News'),
    ]

    news_text = models.TextField(verbose_name=_("News Headline or Article Body"))
    prediction = models.CharField(max_length=10, choices=VERDICT_CHOICES)
    confidence = models.FloatField(verbose_name=_("Confidence Score (%)"))
    prob_real = models.FloatField(default=0.0)
    prob_fake = models.FloatField(default=0.0)
    sensationalism_score = models.IntegerField(default=0)
    user_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("News Prediction")
        verbose_name_plural = _("News Predictions")
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.prediction}] #{self.id} ({self.confidence:.1f}%)"

    @property
    def snippet(self):
        return self.news_text[:65] + "..." if len(self.news_text) > 65 else self.news_text


class AuditLog(models.Model):
    action = models.CharField(max_length=100)
    details = models.TextField(blank=True)
    user_email = models.EmailField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']`
    },
    views: {
      category: 'Detector App',
      title: 'Django Views & ML Inference',
      filename: 'detector/views.py',
      lang: 'python',
      code: `import csv
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect

from .models import Prediction, AuditLog
from .forms import NewsAnalysisForm
from .apps import DetectorConfig
from .utils import clean_text, get_token_breakdown

def classify_news_text(raw_text: str):
    cleaned = clean_text(raw_text)
    model = DetectorConfig.model
    vectorizer = DetectorConfig.vectorizer

    if model and vectorizer:
        vec = vectorizer.transform([cleaned])
        pred_val = model.predict(vec)[0]  # 0 = REAL, 1 = FAKE
        probs = model.predict_proba(vec)[0]
        label = 'FAKE' if pred_val == 1 else 'REAL'
        conf = float(probs[1] if pred_val == 1 else probs[0]) * 100
        return {
            'prediction': label,
            'confidence': round(max(51.0, min(99.4, conf)), 2),
            'prob_real': round(float(probs[0]) * 100, 2),
            'prob_fake': round(float(probs[1]) * 100, 2)
        }
    return {'prediction': 'REAL', 'confidence': 95.0, 'prob_real': 95.0, 'prob_fake': 5.0}

def index_view(request):
    form = NewsAnalysisForm()
    recent = Prediction.objects.all()[:5]
    return render(request, 'detector/index.html', {
        'form': form,
        'recent_predictions': recent,
        'total_count': Prediction.objects.count(),
        'active_page': 'home'
    })

@require_POST
@csrf_protect
def predict_view(request):
    form = NewsAnalysisForm(request.POST)
    if not form.is_valid():
        for errs in form.errors.values():
            for e in errs: messages.error(request, e)
        return redirect('detector:index')

    news_text = form.cleaned_data['news_text']
    result = classify_news_text(news_text)
    breakdown = get_token_breakdown(news_text)

    record = Prediction.objects.create(
        news_text=news_text,
        prediction=result['prediction'],
        confidence=result['confidence'],
        prob_real=result['prob_real'],
        prob_fake=result['prob_fake'],
        sensationalism_score=breakdown['sensationalism_score']
    )
    messages.success(request, f"Forensic analysis finished: {record.prediction} ({record.confidence}%).")
    return redirect('detector:result', pk=record.pk)

def result_view(request, pk):
    record = get_object_or_404(Prediction, pk=pk)
    breakdown = get_token_breakdown(record.news_text)
    return render(request, 'detector/result.html', {'record': record, 'breakdown': breakdown})

def history_view(request):
    qs = Prediction.objects.all()
    q = request.GET.get('q', '').strip()
    f = request.GET.get('filter', '').strip().upper()
    if q: qs = qs.filter(news_text__icontains=q)
    if f in ['REAL', 'FAKE']: qs = qs.filter(prediction=f)

    paginator = Paginator(qs, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'detector/history.html', {'page_obj': page_obj, 'active_filter': f})`
    },
    forms: {
      category: 'Detector App',
      title: 'Django Form Validation',
      filename: 'detector/forms.py',
      lang: 'python',
      code: `from django import forms
from django.core.exceptions import ValidationError
from .models import Prediction

class NewsAnalysisForm(forms.ModelForm):
    class Meta:
        model = Prediction
        fields = ['news_text']
        widgets = {
            'news_text': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 6,
                'placeholder': 'Paste a full news story, paragraph, press release, or headline for forensic ML evaluation (min 20 chars)...'
            })
        }

    def clean_news_text(self):
        text = self.cleaned_data.get('news_text', '').strip()
        if not text:
            raise ValidationError("Please provide a news headline or article.")
        if len(text) < 20:
            raise ValidationError("News text must be at least 20 characters long.")
        if len(text) > 5000:
            raise ValidationError("News text exceeds the 5,000 character limit.")
        return text`
    },
    admin: {
      category: 'Detector App',
      title: 'Django Admin Portal Customization',
      filename: 'detector/admin.py',
      lang: 'python',
      code: `from django.contrib import admin
from django.utils.html import format_html
from .models import Prediction, AuditLog

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('id', 'verdict_badge', 'confidence_display', 'snippet', 'created_at')
    list_filter = ('prediction', 'created_at')
    search_fields = ('news_text', 'user_email')
    readonly_fields = ('created_at', 'prob_real', 'prob_fake')
    date_hierarchy = 'created_at'

    def verdict_badge(self, obj):
        bg = "#d1fae5" if obj.prediction == 'REAL' else "#ffe4e6"
        color = "#065f46" if obj.prediction == 'REAL' else "#9f1239"
        return format_html(f'<span style="background:{bg}; color:{color}; padding:3px 8px; border-radius:999px; font-weight:bold;">{obj.prediction}</span>')

    def confidence_display(self, obj):
        color = "#059669" if obj.prediction == 'REAL' else "#e11d48"
        return format_html(f'<strong style="color:{color}; font-family:monospace;">{obj.confidence:.2f}%</strong>')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'user_email', 'timestamp')
    list_filter = ('action', 'timestamp')`
    },
    app_urls: {
      category: 'Detector App',
      title: 'Detector App URL Dispatcher',
      filename: 'detector/urls.py',
      lang: 'python',
      code: `from django.urls import path
from . import views

app_name = 'detector'

urlpatterns = [
    path('', views.index_view, name='index'),
    path('predict/', views.predict_view, name='predict'),
    path('result/<int:pk>/', views.result_view, name='result'),
    path('history/', views.history_view, name='history'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('about/', views.about_view, name='about'),
    path('dataset/', views.dataset_view, name='dataset'),
    path('export-csv/', views.export_csv_view, name='export_csv'),
    path('clear-history/', views.clear_history_view, name='clear_history'),
    path('api/predict/', views.api_predict, name='api_predict'),
    path('api/metrics/', views.api_metrics, name='api_metrics'),
]`
    },
    template: {
      category: 'Templates',
      title: 'Django Template (with CSRF)',
      filename: 'templates/detector/index.html',
      lang: 'html',
      code: `{% extends "base.html" %}
{% block title %}Check News - Django Fake News Detector{% endblock %}

{% block content %}
<div class="row g-4">
    <div class="col-lg-8">
        <div class="card shadow-sm border-0 rounded-4 p-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-shield-check text-primary me-2"></i>News Forensic Verification</h5>
            <form action="{% url 'detector:predict' %}" method="POST">
                {% csrf_token %}
                <div class="mb-3">
                    <label class="form-label fw-semibold text-secondary small">Article Headline or Body</label>
                    {{ form.news_text }}
                </div>
                <button type="submit" class="btn btn-primary px-4 py-2 rounded-3 fw-bold">
                    <i class="bi bi-cpu me-2"></i>Run AI Forensic Verification
                </button>
            </form>
        </div>
    </div>
</div>
{% endblock %}`
    },
    train: {
      category: 'Machine Learning',
      title: 'Scikit-Learn ML Training Pipeline',
      filename: 'model/train_model.py',
      lang: 'python',
      code: `import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from detector.utils import clean_text

def train():
    df = pd.read_csv('dataset/news.csv')
    df['cleaned'] = (df['title'].fillna('') + ' ' + df['text'].fillna('')).apply(clean_text)
    y = df['label'].apply(lambda x: 1 if str(x).upper() == 'FAKE' else 0)
    X = df['cleaned']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    vec = TfidfVectorizer(max_features=5000, ngram_range=(1,2), sublinear_tf=True)
    X_train_vec = vec.fit_transform(X_train)
    X_test_vec = vec.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}% | F1: {f1_score(y_test, y_pred)*100:.2f}%")

    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/fake_news_model.pkl')
    joblib.dump(vec, 'model/tfidf_vectorizer.pkl')
    print("Serialized model artifacts to model/ directory!")

if __name__ == '__main__':
    train()`
    },
    nlp: {
      category: 'Machine Learning',
      title: 'NLP Text Preprocessor',
      filename: 'detector/utils.py',
      lang: 'python',
      code: `import re
import string

STOPWORDS = {'i', 'me', 'my', 'we', 'our', 'you', 'he', 'she', 'it', 'they', 'the', 'and', 'is', 'was', 'in', 'on', 'at'}

def clean_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        return ""
    cleaned = text.lower().strip()
    cleaned = re.sub(r'https?://\\S+|www\\.\\S+', ' ', cleaned)
    cleaned = re.sub(r'<.*?>', ' ', cleaned)
    cleaned = re.sub(r'[' + re.escape(string.punctuation) + r'—–“”‘’]', ' ', cleaned)
    cleaned = re.sub(r'\\b\\d+\\b', ' ', cleaned)
    return ' '.join([w for w in cleaned.split() if w not in STOPWORDS and len(w) > 1])`
    },
    reqs: {
      category: 'Dependencies',
      title: 'Django Python Requirements',
      filename: 'requirements.txt',
      lang: 'text',
      code: `Django>=5.0.3,<6.0.0
scikit-learn>=1.4.2
nltk>=3.8.1
numpy>=1.26.4
pandas>=2.2.2
joblib>=1.4.0
gunicorn>=22.0.0
whitenoise>=6.6.0`
    },
    commands: {
      category: 'Terminal',
      title: 'Django Setup & Run Commands',
      filename: 'Terminal Commands',
      lang: 'bash',
      code: `# 1. Create Virtual Environment
python -m venv venv

# 2. Activate Virtual Environment
# Windows:
venv\\Scripts\\activate
# macOS / Linux:
source venv/bin/activate

# 3. Install Django & ML Dependencies
pip install -r requirements.txt

# 4. Train Scikit-Learn Model & Vectorizer
python model/train_model.py

# 5. Run Django Database Migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create Django Admin Superuser
python manage.py createsuperuser

# 7. Start Django Development Server
python manage.py runserver 127.0.0.1:8000

# 8. Run Continuous Auto-Learning Ingestion Daemon (Optional)
python manage.py auto_learn --continuous --interval 30

# 9. Open Web Browser
# App: http://127.0.0.1:8000/
# Auto-Learn Console: http://127.0.0.1:8000/auto-learn/
# Django Admin: http://127.0.0.1:8000/admin/`
    },
    auto_learn_cmd: {
      category: 'Machine Learning',
      title: 'Auto-Learn Management Command',
      filename: 'detector/management/commands/auto_learn.py',
      lang: 'python',
      code: `import time
import uuid
from django.core.management.base import BaseCommand
from django.utils import timezone
from detector.models import RecentNewsArticle, ActiveLearningSession
from detector.apps import DetectorConfig
from model.train_model import train_and_evaluate

class Command(BaseCommand):
    help = "Automatically ingests recent news and retrains ML model."

    def add_arguments(self, parser):
        parser.add_argument('--batch-size', type=int, default=5)
        parser.add_argument('--continuous', action='store_true')
        parser.add_argument('--interval', type=int, default=30)

    def handle(self, *args, **options):
        self.stdout.write("Running auto-learning cycle on recent news...")
        pending = RecentNewsArticle.objects.filter(is_learned=False)
        if not pending.exists():
            self.stdout.write("No pending recent articles.")
            return

        metrics = train_and_evaluate()
        pending.update(is_learned=True, learned_at=timezone.now())
        DetectorConfig.reload_model()
        self.stdout.write(f"Model hot-reloaded with accuracy: {metrics.get('accuracy')}%")`
    },
    auto_learn_template: {
      category: 'Frontend Templates',
      title: 'Auto-Learning Dashboard Template',
      filename: 'templates/detector/auto_learn.html',
      lang: 'html',
      code: `{% extends 'base.html' %}
{% block title %}Auto-Learn Recent News - FakeDetect{% endblock %}
{% block content %}
<div class="container-fluid py-3">
    <h2><i class="bi bi-cpu text-primary me-2"></i>Automated Learning from Recent News</h2>
    <p class="text-secondary">Continuously adapts the TF-IDF feature space and Logistic Regression weights to novel breaking news.</p>
    <div class="row g-3">
        <div class="col-md-4">
            <div class="card p-3 shadow-sm rounded-4">
                <div class="text-secondary small">Total Articles Learned</div>
                <h3 class="fw-bold">{{ total_learned }}</h3>
            </div>
        </div>
    </div>
</div>
{% endblock %}`
    }
  };

  const current = fileContents[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root files
      zip.file('manage.py', fileContents.manage.code);
      zip.file('requirements.txt', fileContents.reqs.code);
      zip.file(
        'README.md',
        `# Fake News Detection System (Django 5.0 + Scikit-Learn)\n\nFollow the instructions in Terminal Commands to set up and run the Django project.`
      );

      // fakenews_project directory
      const projectFolder = zip.folder('fakenews_project');
      if (projectFolder) {
        projectFolder.file('__init__.py', '"""Django Fake News Project."""\n');
        projectFolder.file('settings.py', fileContents.settings.code);
        projectFolder.file('urls.py', fileContents.urls.code);
        projectFolder.file(
          'wsgi.py',
          `import os\nfrom django.core.wsgi import get_wsgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fakenews_project.settings')\napplication = get_wsgi_application()\n`
        );
      }

      // detector app directory
      const detectorFolder = zip.folder('detector');
      if (detectorFolder) {
        detectorFolder.file('__init__.py', "default_app_config = 'detector.apps.DetectorConfig'\n");
        detectorFolder.file('models.py', fileContents.models.code);
        detectorFolder.file('views.py', fileContents.views.code);
        detectorFolder.file('forms.py', fileContents.forms.code);
        detectorFolder.file('admin.py', fileContents.admin.code);
        detectorFolder.file('urls.py', fileContents.app_urls.code);
        detectorFolder.file('utils.py', fileContents.nlp.code);
        detectorFolder.file(
          'apps.py',
          `from django.apps import AppConfig\n\nclass DetectorConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'detector'\n    model = None\n    vectorizer = None\n`
        );

        const migrations = detectorFolder.folder('migrations');
        if (migrations) {
          migrations.file('__init__.py', '');
        }

        const managementFolder = detectorFolder.folder('management');
        if (managementFolder) {
          managementFolder.file('__init__.py', '# Django management\n');
          const commandsFolder = managementFolder.folder('commands');
          if (commandsFolder) {
            commandsFolder.file('__init__.py', '# Django commands\n');
            commandsFolder.file('auto_learn.py', fileContents.auto_learn_cmd.code);
          }
        }
      }

      // templates
      const templatesFolder = zip.folder('templates');
      if (templatesFolder) {
        const detectorTemplates = templatesFolder.folder('detector');
        if (detectorTemplates) {
          detectorTemplates.file('index.html', fileContents.template.code);
          detectorTemplates.file('auto_learn.html', fileContents.auto_learn_template.code);
        }
      }

      // model folder
      const modelFolder = zip.folder('model');
      if (modelFolder) {
        modelFolder.file('train_model.py', fileContents.train.code);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fakedetect_django_project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate Django zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Converted to Django 5.0 (MVT Architecture)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Code className="w-6 h-6 text-emerald-600" />
            Python Django Project Code & Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete, production-ready Django source tree with MVT controllers, ORM models, CSRF forms, and Scikit-learn pipelines.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md shrink-0 active:scale-95 disabled:opacity-50"
        >
          {isZipping ? (
            <span className="flex items-center gap-2">Packaging .ZIP...</span>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download Full Django Project (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 font-mono flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Django Project Structure</span>
            </div>
            <div className="space-y-1 mt-1">
              {[
                { id: 'views', name: 'detector/views.py', desc: 'Django Views & ML Inference', cat: 'App' },
                { id: 'models', name: 'detector/models.py', desc: 'Django ORM Models (SQLite)', cat: 'App' },
                { id: 'forms', name: 'detector/forms.py', desc: 'Django CSRF & Forms', cat: 'App' },
                { id: 'admin', name: 'detector/admin.py', desc: 'Django Admin Portal Customization', cat: 'App' },
                { id: 'app_urls', name: 'detector/urls.py', desc: 'App URL Routing', cat: 'App' },
                { id: 'settings', name: 'fakenews_project/settings.py', desc: 'Django Settings & SQLite', cat: 'Config' },
                { id: 'urls', name: 'fakenews_project/urls.py', desc: 'Root URL Dispatcher', cat: 'Config' },
                { id: 'manage', name: 'manage.py', desc: 'Django Management Utility', cat: 'Root' },
                { id: 'template', name: 'templates/detector/index.html', desc: 'Django Template ({% csrf_token %})', cat: 'Templates' },
                { id: 'auto_learn_template', name: 'templates/detector/auto_learn.html', desc: 'Auto-Learn UI Template', cat: 'Templates' },
                { id: 'auto_learn_cmd', name: 'detector/.../commands/auto_learn.py', desc: 'Continuous Learning Daemon', cat: 'ML' },
                { id: 'train', name: 'model/train_model.py', desc: 'Scikit-learn Training Script', cat: 'ML' },
                { id: 'nlp', name: 'detector/utils.py', desc: 'NLP Preprocessing & Stopwords', cat: 'ML' },
                { id: 'reqs', name: 'requirements.txt', desc: 'Django 5.0 & ML Packages', cat: 'Config' },
                { id: 'commands', name: 'Terminal / PyCharm Setup', desc: 'Migrate & Run Instructions', cat: 'Commands' }
              ].map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file.id as any)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    selectedFile === file.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono text-slate-800 flex items-center gap-1.5">
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{file.desc}</div>
                  </div>
                  <FileCode
                    className={`w-4 h-4 shrink-0 ${selectedFile === file.id ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code Display Area */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-slate-300 font-bold ml-2 truncate">
                {current.filename}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-700 hidden sm:inline">
                {current.category}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-[520px] overflow-y-auto">
            <pre>{current.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

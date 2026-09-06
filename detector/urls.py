"""
Django URL patterns for detector app.
"""

from django.urls import path
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
    path('auto-learn/', views.auto_learn_view, name='auto_learn'),
    path('export-csv/', views.export_csv_view, name='export_csv'),
    path('clear-history/', views.clear_history_view, name='clear_history'),
    # REST API endpoints
    path('api/predict/', views.api_predict, name='api_predict'),
    path('api/metrics/', views.api_metrics, name='api_metrics'),
    path('api/auto-learn/ingest/', views.api_auto_learn_ingest, name='api_auto_learn_ingest'),
    path('api/auto-learn/retrain/', views.api_trigger_retrain, name='api_auto_learn_retrain'),
]

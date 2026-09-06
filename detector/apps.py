import os
import json
import logging
from django.apps import AppConfig
from django.conf import settings

logger = logging.getLogger(__name__)

class DetectorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detector'
    verbose_name = 'Fake News Detector'

    # Global holders for trained ML pipeline
    model = None
    vectorizer = None
    metrics = {}

    def ready(self):
        """
        Executed when Django initializes.
        Loads trained TF-IDF vectorizer and Scikit-learn Classifier into memory.
        """
        model_path = getattr(settings, 'ML_MODEL_PATH', None)
        vectorizer_path = getattr(settings, 'ML_VECTORIZER_PATH', None)
        metrics_path = getattr(settings, 'ML_METRICS_PATH', None)

        if metrics_path and os.path.exists(metrics_path):
            try:
                with open(metrics_path, 'r', encoding='utf-8') as f:
                    DetectorConfig.metrics = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load metrics: {e}")

        if model_path and vectorizer_path and os.path.exists(model_path) and os.path.exists(vectorizer_path):
            try:
                import joblib
                DetectorConfig.model = joblib.load(model_path)
                DetectorConfig.vectorizer = joblib.load(vectorizer_path)
                logger.info("Successfully loaded ML model and TF-IDF vectorizer.")
            except Exception as e:
                logger.warning(f"Could not load ML artifacts: {e}")

    @classmethod
    def reload_model(cls):
        """
        Hot-reloads the Scikit-learn model and TF-IDF vectorizer into Django memory
        without requiring a server restart after auto-learning recent news.
        """
        model_path = getattr(settings, 'ML_MODEL_PATH', None)
        vectorizer_path = getattr(settings, 'ML_VECTORIZER_PATH', None)
        metrics_path = getattr(settings, 'ML_METRICS_PATH', None)

        if metrics_path and os.path.exists(metrics_path):
            try:
                with open(metrics_path, 'r', encoding='utf-8') as f:
                    cls.metrics = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to reload metrics: {e}")

        if model_path and vectorizer_path and os.path.exists(model_path) and os.path.exists(vectorizer_path):
            try:
                import joblib
                cls.model = joblib.load(model_path)
                cls.vectorizer = joblib.load(vectorizer_path)
                logger.info("Successfully hot-reloaded updated ML artifacts into Django memory.")
                return True
            except Exception as e:
                logger.error(f"Failed to hot-reload ML artifacts: {e}")
                return False
        return False


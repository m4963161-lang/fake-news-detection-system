"""
Django Management Command: auto_learn
Usage:
    python manage.py auto_learn
    python manage.py auto_learn --batch-size 10
    python manage.py auto_learn --continuous --interval 30
    python manage.py auto_learn --dry-run
"""

import time
import uuid
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from detector.models import RecentNewsArticle, ActiveLearningSession
from detector.apps import DetectorConfig
from model.train_model import train_and_evaluate

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Automatically ingests recent breaking news and continuously retrains the ML model."

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=5,
            help='Minimum number of pending recent news articles before triggering retraining (default: 5)'
        )
        parser.add_argument(
            '--continuous',
            action='store_true',
            help='Run as a daemon loop periodically checking for novel recent news articles'
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=30,
            help='Polling interval in seconds when running in continuous mode (default: 30)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate recent news learning without persisting model updates'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        continuous = options['continuous']
        interval = options['interval']
        dry_run = options['dry_run']

        self.stdout.write(self.style.SUCCESS("=" * 65))
        self.stdout.write(self.style.SUCCESS("🧠 AUTO-LEARNING SUBSYSTEM: RECENT NEWS INGESTION"))
        self.stdout.write(self.style.SUCCESS("=" * 65))
        self.stdout.write(f"[*] Batch threshold : {batch_size} articles")
        self.stdout.write(f"[*] Continuous mode : {'ENABLED' if continuous else 'SINGLE-RUN'}")
        if continuous:
            self.stdout.write(f"[*] Stream Interval : {interval} seconds")

        if continuous:
            self.stdout.write(self.style.WARNING("[*] Starting continuous auto-learning worker loop. Press Ctrl+C to stop."))
            try:
                while True:
                    self._run_learning_cycle(batch_size, dry_run)
                    time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.SUCCESS("\n[✓] Auto-learning worker stopped gracefully."))
        else:
            self._run_learning_cycle(batch_size, dry_run)

    def _run_learning_cycle(self, batch_size: int, dry_run: bool):
        pending_articles = RecentNewsArticle.objects.filter(is_learned=False)
        pending_count = pending_articles.count()

        self.stdout.write(f"\n[*] Scanning recent news queue... Found {pending_count} pending articles.")

        if pending_count == 0:
            self.stdout.write(self.style.NOTICE("[-] No unlearned recent news articles in queue. Waiting for new stream items."))
            return

        if pending_count < batch_size and not dry_run:
            self.stdout.write(
                self.style.NOTICE(f"[-] Pending articles ({pending_count}) below batch threshold ({batch_size}). Waiting for more incoming streams.")
            )
            return

        current_metrics = DetectorConfig.metrics or {}
        acc_before = current_metrics.get('accuracy', 96.25)

        self.stdout.write(self.style.MIGRATE_HEADING(f"[*] Ingesting {pending_count} novel recent news stories into training corpus..."))

        for article in pending_articles[:batch_size]:
            self.stdout.write(f"    - [{article.category}] {article.title[:50]}... ({article.source})")

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f"[DRY-RUN] Would retrain model on {pending_count} recent news items. Exiting without write."))
            return

        # Execute training pipeline
        try:
            self.stdout.write("[*] Triggering Scikit-learn TF-IDF & Logistic Regression retraining...")
            metrics_data = train_and_evaluate()
            acc_after = metrics_data.get('accuracy', acc_before)

            # Mark articles as learned
            now = timezone.now()
            updated_count = pending_articles[:batch_size].update(is_learned=True, learned_at=now)

            # Hot-reload in memory
            hot_reloaded = DetectorConfig.reload_model()

            # Record active learning session
            session_id = f"learn-{uuid.uuid4().hex[:8]}"
            ActiveLearningSession.objects.create(
                session_id=session_id,
                model_version=f"v1.auto.{session_id[:4]}",
                accuracy_before=acc_before,
                accuracy_after=acc_after,
                articles_ingested=updated_count,
                trigger_type="auto_stream",
                details=f"Learned from {updated_count} recent news articles. Hot reload: {hot_reloaded}"
            )

            self.stdout.write(self.style.SUCCESS(f"[✓] Active Learning Cycle Complete!"))
            self.stdout.write(self.style.SUCCESS(f"    - Ingested Articles : {updated_count}"))
            self.stdout.write(self.style.SUCCESS(f"    - Accuracy Delta    : {acc_before}% -> {acc_after}%"))
            self.stdout.write(self.style.SUCCESS(f"    - Memory Reload     : {'SUCCESS' if hot_reloaded else 'FAILED'}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"[!] Auto-learning cycle failed: {e}"))
            logger.error(f"Auto-learning error: {e}", exc_info=True)

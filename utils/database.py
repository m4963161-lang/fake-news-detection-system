"""
Database Utility Module using Flask-SQLAlchemy & SQLite
Fake News Detection System
"""

import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """
    User model supporting both standard Analysts and System Administrators.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'
    department = db.Column(db.String(120), default='Fact Checking Desk')
    status = db.Column(db.String(20), default='active')  # 'active' or 'suspended'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'status': self.status,
            'created_at': self.created_at.strftime('%d %b %Y') if self.created_at else ''
        }


class Prediction(db.Model):
    """
    Prediction database table model storing verified news items.
    """
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    news_text = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(10), nullable=False)  # 'REAL' or 'FAKE'
    confidence = db.Column(db.Float, nullable=False)        # e.g., 94.72
    user_email = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'news_text': self.news_text,
            'prediction': self.prediction,
            'confidence': round(self.confidence, 2),
            'user_email': self.user_email or 'system',
            'created_at': self.created_at.strftime('%d %b %Y %I:%M %p') if self.created_at else ''
        }


def init_db(app):
    """
    Initializes database directory, tables, and seeds initial accounts if needed.
    """
    db_dir = os.path.join(app.root_path, 'database')
    os.makedirs(db_dir, exist_ok=True)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(db_dir, 'predictions.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_default_users()


def seed_default_users():
    """
    Seeds default User and Admin credentials for testing.
    """
    if not User.query.filter_by(email='admin@fakedetect.org').first():
        admin = User(
            name='Dr. Sarah Chen',
            email='admin@fakedetect.org',
            role='admin',
            department='ML & AI Safety Directorate',
            status='active'
        )
        admin.set_password('admin123')
        db.session.add(admin)

    if not User.query.filter_by(email='user@fakedetect.org').first():
        user = User(
            name='Alex Rivera',
            email='user@fakedetect.org',
            role='user',
            department='Editorial Fact-Checking Desk',
            status='active'
        )
        user.set_password('user123')
        db.session.add(user)

    db.session.commit()


def save_prediction(news_text: str, prediction: str, confidence: float, user_email: str = None) -> Prediction:
    """
    Inserts a new prediction record into SQLite.
    """
    record = Prediction(
        news_text=news_text.strip(),
        prediction=prediction.upper(),
        confidence=float(confidence),
        user_email=user_email,
        created_at=datetime.utcnow()
    )
    db.session.add(record)
    db.session.commit()
    return record


def get_all_predictions(limit: int = 100, filter_label: str = None):
    """
    Fetches prediction records sorted by most recent first.
    """
    query = Prediction.query
    if filter_label and filter_label.upper() in ['REAL', 'FAKE']:
        query = query.filter_by(prediction=filter_label.upper())
    return query.order_by(Prediction.created_at.desc()).limit(limit).all()


def get_prediction_by_id(pred_id: int):
    """
    Retrieves a single prediction by its primary key ID.
    """
    return Prediction.query.get(pred_id)


def clear_all_predictions() -> int:
    """
    Deletes all records from the predictions table.
    """
    count = Prediction.query.count()
    Prediction.query.delete()
    db.session.commit()
    return count


def get_dashboard_stats():
    """
    Calculates aggregated statistics for the analytics dashboard.
    """
    total = Prediction.query.count()
    real_count = Prediction.query.filter_by(prediction='REAL').count()
    fake_count = Prediction.query.filter_by(prediction='FAKE').count()
    
    # Calculate average confidence
    avg_conf = 0.0
    if total > 0:
        records = Prediction.query.all()
        avg_conf = sum(r.confidence for r in records) / total

    return {
        'total_predictions': total,
        'real_news_count': real_count,
        'fake_news_count': fake_count,
        'avg_confidence': round(avg_conf, 2),
        'real_percentage': round((real_count / total * 100), 1) if total > 0 else 0,
        'fake_percentage': round((fake_count / total * 100), 1) if total > 0 else 0,
    }


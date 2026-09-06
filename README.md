# FakeDetect — Django Fake News Detection System

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4.2-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

A full-stack, production-grade **Fake News Detection Web Application** converted to **Django 5.0 (MVT Architecture)** with **Scikit-Learn Machine Learning, NLP (Natural Language Processing), TF-IDF Feature Extraction, Django ORM + SQLite database, Django Admin Panel, and Bootstrap 5 UI**.

---

## 1. Project Overview & Django Conversion

This project has been fully architected using the standard **Django Model-View-Template (MVT)** design pattern. It provides an automated forensic artificial intelligence system to evaluate news articles and headlines, calculate calibrated confidence probabilities, detect sensationalism markers, and maintain persistent verification history through the Django ORM.

### Django Project Directory Layout
```text
fakedetect-django/
├── manage.py                     # Django CLI command-line manager
├── fakenews_project/             # Project configuration module
│   ├── __init__.py
│   ├── settings.py               # Django settings (INSTALLED_APPS, DATABASES, TEMPLATES)
│   ├── urls.py                   # Root URL dispatcher
│   ├── wsgi.py                   # WSGI deployment entry point
│   └── asgi.py                   # ASGI asynchronous entry point
├── detector/                     # Core Fake News Detection application
│   ├── __init__.py
│   ├── apps.py                   # App configuration & ML model lazy loading
│   ├── models.py                 # Django ORM models (Prediction, AuditLog, Feedback)
│   ├── views.py                  # Django Controller views & REST API endpoints
│   ├── urls.py                   # App-specific URL routes
│   ├── forms.py                  # Django Forms with CSRF & input validation
│   ├── admin.py                  # Django Admin customized registration
│   ├── utils.py                  # NLP text cleaning & token breakdown utilities
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py       # Database schema migrations
├── templates/                    # Django Template layouts
│   ├── base.html                 # Master layout with Bootstrap 5
│   └── detector/
│       ├── index.html            # Verification form with CSRF token & preset samples
│       ├── result.html           # Prediction outcome, confidence & token radar
│       ├── history.html          # Django paginated prediction archive
│       ├── dashboard.html        # Telemetry & Chart.js visualizations
│       ├── about.html            # MVT architecture specs & documentation
│       └── dataset.html          # Training corpus explorer
├── static/                       # Static assets (CSS, JS, images)
├── dataset/
│   └── news.csv                  # Training corpus
├── model/
│   ├── train_model.py            # Scikit-learn TF-IDF + Logistic Regression pipeline
│   ├── fake_news_model.pkl       # Serialized Logistic Regression model
│   ├── tfidf_vectorizer.pkl      # Serialized TF-IDF vectorizer
│   └── metrics.json              # Evaluated model performance scores
├── requirements.txt              # Python dependency manifest
└── README.md
```

---

## 2. Quick Start & Setup Instructions

### Step 1: Create and Activate Virtual Environment
```bash
# Clone or navigate to the project directory
cd fakedetect-django

# Create a virtual environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on macOS / Linux:
source venv/bin/activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Train the Machine Learning Pipeline
Trains the TF-IDF Vectorizer and Logistic Regression Classifier on `dataset/news.csv` and serializes artifacts to `model/`:
```bash
python model/train_model.py
```

### Step 4: Run Django Database Migrations
Creates the SQLite database (`db.sqlite3`) and initial schema for `Prediction`, `AuditLog`, and `Feedback` models:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: (Optional) Create Django Admin Superuser
```bash
python manage.py createsuperuser
```

### Step 6: Start the Django Development Server
```bash
python manage.py runserver 127.0.0.1:8000
```
Open your browser at **http://127.0.0.1:8000/** to test the news detector, or visit **http://127.0.0.1:8000/admin/** to manage records in the Django Admin Console.

---

## 3. Django Features & Architecture

- **Django MVT Architecture**: Clean separation between database models (`models.py`), request routing and business logic (`views.py`), and presentation (`templates/`).
- **Django ORM**: Fully parameterized database interactions preventing SQL injection vulnerabilities.
- **CSRF Protection**: All POST forms include Django's `{% csrf_token %}` to prevent Cross-Site Request Forgery.
- **Form Validation**: Submissions are validated using `NewsAnalysisForm` ensuring length constraints and input sanitization.
- **Django Admin Interface**: Rich management dashboard with custom badges, date hierarchy, search, and filtering on predictions and audit logs.
- **Scikit-Learn ML Model**:
  - Unigram and bigram TF-IDF vectorization (`ngram_range=(1,2)`).
  - Regularized Logistic Regression with calibrated probability confidence.
- **REST API Endpoints**:
  - `POST /api/predict/` — Programmatic text classification payload.
  - `GET /api/metrics/` — Real-time model evaluation telemetry.
- **CSV Export**: Stream live prediction history reports via `GET /export-csv/`.

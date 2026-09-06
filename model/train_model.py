"""
Model Training Script for Fake News Detection System
Trains TF-IDF Vectorizer and Logistic Regression Classifier on dataset/news.csv
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.preprocessing import clean_text


def load_and_validate_dataset(csv_path: str) -> pd.DataFrame:
    """
    Validates and loads news dataset with informative error messages.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at path: {csv_path}. Please place news.csv in dataset/ directory.")

    df = pd.read_csv(csv_path)
    if df.empty:
        raise ValueError(f"Dataset at {csv_path} is empty.")

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    if 'label' not in df.columns:
        raise KeyError(f"Missing required 'label' column. Available columns: {list(df.columns)}")

    # Ensure text or title exists
    if 'text' not in df.columns and 'title' not in df.columns:
        raise KeyError(f"Dataset must contain 'text' or 'title' column. Found: {list(df.columns)}")

    # Combine title and text if both exist
    if 'title' in df.columns and 'text' in df.columns:
        df['combined_text'] = df['title'].fillna('') + ' ' + df['text'].fillna('')
    elif 'text' in df.columns:
        df['combined_text'] = df['text'].fillna('')
    else:
        df['combined_text'] = df['title'].fillna('')

    # Clean missing entries
    df = df[df['combined_text'].str.strip() != ''].copy()

    # Map labels to binary standard: 0 = REAL, 1 = FAKE
    def map_label(val):
        s = str(val).strip().upper()
        if s in ['1', 'FAKE', 'FALSE', 'UNRELIABLE', 'HOAX', 'DISINFORMATION']:
            return 1
        elif s in ['0', 'REAL', 'TRUE', 'RELIABLE', 'ACCURATE', 'AUTHENTIC']:
            return 0
        else:
            raise ValueError(f"Unrecognized label value: {val}")

    df['binary_label'] = df['label'].apply(map_label)
    return df


def train_and_evaluate(dataset_path: str = None):
    """
    Executes end-to-end ML pipeline training and serialization.
    """
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if dataset_path is None:
        dataset_path = os.path.join(base_dir, 'dataset', 'news.csv')

    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)

    print("=" * 60)
    print("🚀 FAKEDETECT ML TRAINING PIPELINE")
    print("=" * 60)
    print(f"[*] Loading dataset from: {dataset_path}")
    
    df = load_and_validate_dataset(dataset_path)
    total_samples = len(df)
    real_count = int((df['binary_label'] == 0).sum())
    fake_count = int((df['binary_label'] == 1).sum())

    print(f"[+] Total samples loaded: {total_samples}")
    print(f"    - REAL news samples: {real_count}")
    print(f"    - FAKE news samples: {fake_count}")

    print("[*] Preprocessing text data with NLP pipeline...")
    df['cleaned_text'] = df['combined_text'].apply(clean_text)

    # Filter out any samples that became empty after cleaning
    df = df[df['cleaned_text'].str.strip() != ''].copy()

    X = df['cleaned_text']
    y = df['binary_label']

    # Train / Test Split
    test_size = 0.25 if len(df) >= 20 else 0.2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
    )

    print(f"[*] Train set size: {len(X_train)} | Test set size: {len(X_test)}")
    print("[*] Fitting TF-IDF Vectorizer (max_features=5000, n-grams=(1,2))...")

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("[*] Training Logistic Regression classifier (C=1.0, max_iter=1000)...")
    model = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)

    # Evaluation
    y_pred = model.predict(X_test_vec)
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n" + "=" * 60)
    print("📊 MODEL PERFORMANCE EVALUATION")
    print("=" * 60)
    print(f"Accuracy  : {accuracy * 100:.2f}%")
    print(f"Precision : {precision * 100:.2f}%")
    print(f"Recall    : {recall * 100:.2f}%")
    print(f"F1 Score  : {f1 * 100:.2f}%")
    print(f"\nConfusion Matrix:\n{np.array(cm)}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['REAL', 'FAKE'], zero_division=0))

    # Top indicative terms for Fake vs Real
    feature_names = np.array(vectorizer.get_feature_names_out())
    coef = model.coef_[0]
    top_fake_indices = np.argsort(coef)[-15:]
    top_real_indices = np.argsort(coef)[:15]

    top_fake_words = feature_names[top_fake_indices].tolist()
    top_real_words = feature_names[top_real_indices].tolist()

    # Save artifacts
    model_path = os.path.join(model_dir, 'fake_news_model.pkl')
    vec_path = os.path.join(model_dir, 'tfidf_vectorizer.pkl')
    metrics_path = os.path.join(model_dir, 'metrics.json')

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)

    metrics_data = {
        'model_name': 'Logistic Regression',
        'vectorizer': 'TF-IDF (1, 2)-grams',
        'dataset_file': 'dataset/news.csv',
        'total_samples': total_samples,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'accuracy': round(accuracy * 100, 2),
        'precision': round(precision * 100, 2),
        'recall': round(recall * 100, 2),
        'f1_score': round(f1 * 100, 2),
        'confusion_matrix': cm,
        'top_fake_indicators': top_fake_words[::-1],
        'top_real_indicators': top_real_words
    }

    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)

    print(f"\n[✓] Saved Model to: {model_path}")
    print(f"[✓] Saved Vectorizer to: {vec_path}")
    print(f"[✓] Saved Metrics to: {metrics_path}")
    print("=" * 60)
    print("Training complete successfully!")

    return metrics_data


if __name__ == '__main__':
    train_and_evaluate()

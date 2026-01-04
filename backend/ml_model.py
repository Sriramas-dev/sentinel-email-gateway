import pickle
import os
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from datetime import datetime, timezone
import random

MODEL_DIR = Path(__file__).parent / 'models'
MODEL_DIR.mkdir(exist_ok=True)

VECTORIZER_PATH = MODEL_DIR / 'vectorizer.pkl'
CLASSIFIER_PATH = MODEL_DIR / 'classifier.pkl'
STATS_PATH = MODEL_DIR / 'stats.pkl'

PHISHING_SAMPLES = [
    "Urgent: Your account has been compromised. Click here immediately to verify your identity.",
    "Congratulations! You've won $10,000. Claim your prize now by providing your bank details.",
    "Your password will expire today. Update it now to avoid account suspension.",
    "Action required: Unusual activity detected. Confirm your information immediately.",
    "Dear valued customer, we need to verify your payment method. Click the link below.",
    "Security alert: Your account was accessed from unknown location. Reset password now.",
    "You have received a wire transfer. Download the attached file to view details.",
    "IRS notice: You have unpaid taxes. Pay immediately to avoid legal action.",
    "Your package delivery failed. Update shipping address to receive your item.",
    "CEO urgent request: I need you to process this payment immediately. Keep confidential.",
    "Verify your email address to continue using our services. Account will be deleted.",
    "Suspicious login attempt blocked. Confirm your identity within 24 hours.",
    "Your invoice is overdue. Click here to avoid service interruption.",
    "Banking security update required. Download our new security software now.",
    "Refund notification: You are eligible for $500 refund. Claim within 48 hours."
]

LEGITIMATE_SAMPLES = [
    "Hi team, please review the quarterly report I sent earlier. Let me know your thoughts.",
    "Meeting scheduled for tomorrow at 3 PM. See you in the conference room.",
    "Thanks for your purchase! Your order #12345 will ship within 2-3 business days.",
    "Your monthly statement is now available. Log in to your account to view it.",
    "Welcome to our newsletter! Here are this week's featured articles.",
    "Reminder: Your subscription renews on March 15th. No action needed.",
    "Project update: We've completed phase 1 and are moving to phase 2 next week.",
    "Thank you for attending our webinar. Here are the slides we discussed.",
    "Your flight booking confirmation for June 10th. Check-in opens 24 hours before departure.",
    "Hi, I wanted to follow up on our conversation from last week about the proposal.",
    "System maintenance scheduled for this weekend. Services may be briefly unavailable.",
    "New feature announcement: We've added dark mode to the application.",
    "Your appointment with Dr. Smith is confirmed for April 5th at 2:00 PM.",
    "Invoice #8765 for services rendered in February. Payment due within 30 days.",
    "Thanks for your feedback! We're working on the improvements you suggested."
]

def train_model():
    """Train the ML model with sample data"""
    X_train = PHISHING_SAMPLES + LEGITIMATE_SAMPLES
    y_train = [1] * len(PHISHING_SAMPLES) + [0] * len(LEGITIMATE_SAMPLES)
    
    vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
    X_vectorized = vectorizer.fit_transform(X_train)
    
    classifier = LogisticRegression(random_state=42, max_iter=1000)
    classifier.fit(X_vectorized, y_train)
    
    accuracy = classifier.score(X_vectorized, y_train)
    
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    with open(CLASSIFIER_PATH, 'wb') as f:
        pickle.dump(classifier, f)
    
    stats = {
        'accuracy': accuracy,
        'last_trained': datetime.now(timezone.utc).isoformat(),
        'version': 1,
        'training_samples': len(X_train)
    }
    
    with open(STATS_PATH, 'wb') as f:
        pickle.dump(stats, f)
    
    return stats

def load_model():
    """Load the trained model"""
    if not VECTORIZER_PATH.exists() or not CLASSIFIER_PATH.exists():
        return train_model()
    
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    
    with open(CLASSIFIER_PATH, 'rb') as f:
        classifier = pickle.load(f)
    
    return vectorizer, classifier

def get_model_stats():
    """Get model statistics"""
    if not STATS_PATH.exists():
        return train_model()
    
    with open(STATS_PATH, 'rb') as f:
        return pickle.load(f)

def predict_phishing_score(text: str) -> float:
    """Predict phishing intent score (0.0-1.0)"""
    vectorizer, classifier = load_model()
    
    text_vectorized = vectorizer.transform([text])
    proba = classifier.predict_proba(text_vectorized)[0]
    
    return float(proba[1])

def retrain_with_feedback(feedback_data: list):
    """Retrain model with admin feedback"""
    vectorizer, classifier = load_model()
    
    X_new = [item['text'] for item in feedback_data]
    y_new = [1 if item['is_phishing'] else 0 for item in feedback_data]
    
    X_combined = PHISHING_SAMPLES + LEGITIMATE_SAMPLES + X_new
    y_combined = [1] * len(PHISHING_SAMPLES) + [0] * len(LEGITIMATE_SAMPLES) + y_new
    
    vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
    X_vectorized = vectorizer.fit_transform(X_combined)
    
    classifier = LogisticRegression(random_state=42, max_iter=1000)
    classifier.fit(X_vectorized, y_combined)
    
    accuracy = classifier.score(X_vectorized, y_combined)
    
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    with open(CLASSIFIER_PATH, 'wb') as f:
        pickle.dump(classifier, f)
    
    old_stats = get_model_stats()
    new_version = old_stats.get('version', 0) + 1
    
    stats = {
        'accuracy': accuracy,
        'last_trained': datetime.now(timezone.utc).isoformat(),
        'version': new_version,
        'training_samples': len(X_combined)
    }
    
    with open(STATS_PATH, 'wb') as f:
        pickle.dump(stats, f)
    
    return stats
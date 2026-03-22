# SENTINEL – Gateway-Level Email Security System

SENTINEL is a gateway-level email security system designed to detect and mitigate phishing and social engineering attacks before emails reach user inboxes.

The system combines Natural Language Processing (NLP) with behavioral sandbox analysis to provide accurate, explainable, and adaptive email threat detection.

---

## 🚀 Features

- Gateway-level email filtering before inbox delivery  
- NLP-based phishing and social engineering detection  
- Behavioral sandbox simulation for threat analysis  
- Explainable decision-making with indicator traces  
- Quarantine system for suspicious emails  
- Feedback-driven model retraining  
- Real-time dashboard for monitoring and analysis  

---

## 🏗️ System Architecture

Frontend (React + CRACO)
↓
REST API Communication (HTTP)
↓
Backend (FastAPI)
├── NLP ML Model (ml_model.py)
├── Sandbox Simulator (sandbox_simulator.py)
├── Database Layer (SQLite)
└── Decision Engine

---

## ⚙️ Tech Stack

**Frontend**
- React
- CRACO
- Tailwind CSS

**Backend**
- Python
- FastAPI
- Uvicorn

**Machine Learning**
- Scikit-learn
- NLP (TF-IDF based classification)

**Database**
- SQLite

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Sriramas-dev/sentinel-email-gateway.git
cd sentinel-email-gateway

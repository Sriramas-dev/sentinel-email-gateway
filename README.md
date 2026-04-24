# SENTINEL - Gateway-Level Email Security System

SENTINEL is an email security gateway prototype that detects phishing and social engineering content before delivery. The platform combines NLP classification with sandbox-style behavioral traces and provides an operational dashboard for triage and review.

## Key Features

- Real-time email scanning with risk scoring
- Multi-stage verdicts (`CLEAN`, `SUSPICIOUS`, `QUARANTINE`)
- Behavioral sandbox trace simulation for high-risk messages
- Dashboard for threat monitoring and model health metrics
- Feedback loop to support model retraining from reviewed emails

## System Architecture

```text
Frontend (React + CRACO)
        |
        v
REST API (FastAPI)
        |
        v
Detection Pipeline
  - NLP Model (TF-IDF + classifier)
  - Sandbox Behavior Simulator
  - Decision Engine
  - SQLite persistence
```

## Project Structure

```text
.
|-- backend/                  # FastAPI services, ML logic, SQLite access
|   |-- server.py             # API routes
|   |-- ml_model.py           # Inference + retraining
|   |-- sandbox_simulator.py  # Behavioral simulation traces
|   |-- database.py           # SQLite persistence layer
|   `-- .env.example
|-- frontend/                 # React dashboard UI
|   |-- src/pages/            # Main app views
|   |-- src/components/       # Reusable UI blocks
|   `-- .env.example
|-- tests/                    # Lightweight unit coverage
|-- backend_test.py           # API integration smoke workflow
`-- README.md
```

## Local Setup

### 1) Clone and install dependencies

```bash
git clone https://github.com/Sriramas-dev/sentinel-email-gateway.git
cd sentinel-email-gateway
```

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:

```bash
cd ../frontend
yarn install
```

### 2) Configure environment variables

Backend:

```bash
copy backend\.env.example backend\.env
```

Frontend:

```bash
copy frontend\.env.example frontend\.env
```

Default values target local development:
- `backend/.env` -> `CORS_ORIGINS=http://localhost:3000`
- `frontend/.env` -> `REACT_APP_BACKEND_URL=http://localhost:8000`

### 3) Run the project

Backend:

```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
yarn start
```

## Testing

- API flow smoke test:

```bash
python backend_test.py
```

- Unit tests:

```bash
pytest -q
```

## UI Preview Placeholders

Add screenshots to a `docs/screenshots/` folder and update links below:

- Dashboard: `docs/screenshots/dashboard.png`
- Email Scanner: `docs/screenshots/email-scanner.png`
- Quarantine View: `docs/screenshots/quarantine.png`

## Tech Stack

- Frontend: React, CRACO, Tailwind CSS
- Backend: FastAPI, Uvicorn, Pydantic
- ML: scikit-learn (TF-IDF + classifier artifacts)
- Database: SQLite

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
import asyncio

from ml_model import predict_phishing_score, get_model_stats, retrain_with_feedback
from sandbox_simulator import simulate_detonation
from database import (
    init_db, save_email, save_sandbox_logs, get_all_emails,
    get_email_by_id, get_sandbox_logs, update_email_status,
    save_feedback, get_all_feedback, get_stats
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

init_db()

app = FastAPI()
api_router = APIRouter(prefix="/api")

class EmailInput(BaseModel):
    subject: str
    body: str
    sender: str
    recipient: Optional[str] = None

class EmailStatusUpdate(BaseModel):
    status: str

class FeedbackInput(BaseModel):
    email_id: str
    is_phishing: bool
    admin_notes: Optional[str] = ''

@api_router.get("/")
async def root():
    return {"message": "S.E.N.T.I.N.E.L. API Active", "version": "1.0.0"}

@api_router.post("/email/analyze")
async def analyze_email(email: EmailInput):
    """Analyze email for phishing threats"""
    try:
        email_id = str(uuid.uuid4())
        text_content = f"{email.subject} {email.body}"
        
        ml_score = predict_phishing_score(text_content)
        
        if ml_score < 0.5:
            status = "CLEAN"
            sandbox_score = None
            sandbox_result = None
        elif ml_score >= 0.85:
            status = "QUARANTINE"
            sandbox_result = simulate_detonation(email.subject, email.body)
            sandbox_score = sandbox_result['score']
        else:
            status = "SUSPICIOUS"
            sandbox_result = simulate_detonation(email.subject, email.body)
            sandbox_score = sandbox_result['score']
            
            if sandbox_score >= 0.7:
                status = "QUARANTINE"
        
        email_data = {
            'id': email_id,
            'subject': email.subject,
            'body': email.body,
            'sender': email.sender,
            'recipient': email.recipient,
            'ml_score': ml_score,
            'sandbox_score': sandbox_score,
            'status': status,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        save_email(email_data)
        
        if sandbox_result:
            save_sandbox_logs(email_id, sandbox_result['traces'])
        
        return {
            'email_id': email_id,
            'ml_score': ml_score,
            'sandbox_score': sandbox_score,
            'status': status,
            'sandbox_result': sandbox_result,
            'timestamp': email_data['timestamp']
        }
    
    except Exception as e:
        logging.error(f"Error analyzing email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/emails")
async def list_emails(limit: int = 100):
    """List all emails"""
    try:
        emails = get_all_emails(limit)
        return {'emails': emails, 'count': len(emails)}
    except Exception as e:
        logging.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/emails/{email_id}")
async def get_email(email_id: str):
    """Get email by ID"""
    try:
        email = get_email_by_id(email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        
        logs = get_sandbox_logs(email_id)
        
        return {
            'email': email,
            'sandbox_logs': logs
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/emails/{email_id}/status")
async def update_status(email_id: str, update: EmailStatusUpdate):
    """Update email status"""
    try:
        email = get_email_by_id(email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        
        update_email_status(email_id, update.status)
        
        return {'message': 'Status updated successfully', 'email_id': email_id, 'new_status': update.status}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackInput):
    """Submit admin feedback for model training"""
    try:
        email = get_email_by_id(feedback.email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        
        save_feedback(feedback.email_id, feedback.is_phishing, feedback.admin_notes)
        
        return {'message': 'Feedback saved successfully', 'email_id': feedback.email_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error saving feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/model/retrain")
async def retrain_model():
    """Retrain ML model with feedback data"""
    try:
        feedback_data = get_all_feedback()
        
        if len(feedback_data) < 5:
            raise HTTPException(status_code=400, detail="Insufficient feedback data for retraining (minimum 5 required)")
        
        training_data = [
            {'text': f"{f['subject']} {f['body']}", 'is_phishing': bool(f['is_phishing'])}
            for f in feedback_data
        ]
        
        stats = retrain_with_feedback(training_data)
        
        return {
            'message': 'Model retrained successfully',
            'stats': stats
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retraining model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/model/stats")
async def model_stats():
    """Get ML model statistics"""
    try:
        stats = get_model_stats()
        return stats
    except Exception as e:
        logging.error(f"Error fetching model stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/stats")
async def dashboard_stats():
    """Get dashboard statistics"""
    try:
        stats = get_stats()
        model_info = get_model_stats()
        
        return {
            'emails': stats,
            'model': model_info
        }
    except Exception as e:
        logging.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sandbox/live")
async def live_sandbox_stream():
    """Stream live sandbox logs (Server-Sent Events)"""
    async def event_generator():
        emails = get_all_emails(limit=10)
        for email in emails:
            if email.get('sandbox_score'):
                logs = get_sandbox_logs(email['id'])
                for log in logs:
                    yield f"data: {json.dumps(log['trace'])}\n\n"
                    await asyncio.sleep(0.1)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
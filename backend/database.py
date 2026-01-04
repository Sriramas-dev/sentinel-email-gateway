import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Optional
import json

DB_PATH = Path(__file__).parent / 'sentinel.db'

def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emails (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            sender TEXT NOT NULL,
            recipient TEXT,
            ml_score REAL NOT NULL,
            sandbox_score REAL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sandbox_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id TEXT NOT NULL,
            trace TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (email_id) REFERENCES emails (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id TEXT NOT NULL,
            is_phishing INTEGER NOT NULL,
            admin_notes TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (email_id) REFERENCES emails (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def save_email(email_data: Dict) -> None:
    """Save email to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO emails (id, subject, body, sender, recipient, ml_score, sandbox_score, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        email_data['id'],
        email_data['subject'],
        email_data['body'],
        email_data['sender'],
        email_data.get('recipient', 'N/A'),
        email_data['ml_score'],
        email_data.get('sandbox_score'),
        email_data['status'],
        email_data['timestamp']
    ))
    
    conn.commit()
    conn.close()

def save_sandbox_logs(email_id: str, traces: List[Dict]) -> None:
    """Save sandbox traces to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for trace in traces:
        cursor.execute('''
            INSERT INTO sandbox_logs (email_id, trace, timestamp)
            VALUES (?, ?, ?)
        ''', (email_id, json.dumps(trace), trace['timestamp']))
    
    conn.commit()
    conn.close()

def get_all_emails(limit: int = 100) -> List[Dict]:
    """Get all emails from database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM emails ORDER BY timestamp DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    
    conn.close()
    
    return [dict(row) for row in rows]

def get_email_by_id(email_id: str) -> Optional[Dict]:
    """Get email by ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM emails WHERE id = ?', (email_id,))
    row = cursor.fetchone()
    
    conn.close()
    
    return dict(row) if row else None

def get_sandbox_logs(email_id: str) -> List[Dict]:
    """Get sandbox logs for an email"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM sandbox_logs WHERE email_id = ? ORDER BY timestamp ASC', (email_id,))
    rows = cursor.fetchall()
    
    conn.close()
    
    logs = []
    for row in rows:
        log_dict = dict(row)
        log_dict['trace'] = json.loads(log_dict['trace'])
        logs.append(log_dict)
    
    return logs

def update_email_status(email_id: str, status: str) -> None:
    """Update email status"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE emails SET status = ? WHERE id = ?', (status, email_id))
    
    conn.commit()
    conn.close()

def save_feedback(email_id: str, is_phishing: bool, admin_notes: str = '') -> None:
    """Save admin feedback"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO feedback (email_id, is_phishing, admin_notes, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (email_id, 1 if is_phishing else 0, admin_notes, datetime.now(timezone.utc).isoformat()))
    
    conn.commit()
    conn.close()

def get_all_feedback() -> List[Dict]:
    """Get all feedback for retraining"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT f.*, e.subject, e.body
        FROM feedback f
        JOIN emails e ON f.email_id = e.id
        ORDER BY f.timestamp DESC
    ''')
    rows = cursor.fetchall()
    
    conn.close()
    
    return [dict(row) for row in rows]

def get_stats() -> Dict:
    """Get dashboard statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM emails')
    total = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM emails WHERE status = "CLEAN"')
    clean = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM emails WHERE status = "QUARANTINE"')
    quarantine = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM emails WHERE status = "SUSPICIOUS"')
    suspicious = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'total': total,
        'clean': clean,
        'quarantine': quarantine,
        'suspicious': suspicious
    }
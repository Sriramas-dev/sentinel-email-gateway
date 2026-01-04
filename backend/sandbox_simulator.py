import random
import re
from datetime import datetime, timezone
from typing import List, Dict

MALICIOUS_INDICATORS = [
    'bit.ly', 'tinyurl', 'goo.gl', 'ow.ly',
    '.exe', '.scr', '.bat', '.cmd', '.vbs',
    'password', 'verify', 'urgent', 'click here',
    'suspended', 'expire', 'confirm',
    'unusual activity', 'security alert'
]

SAFE_DOMAINS = [
    'gmail.com', 'outlook.com', 'yahoo.com',
    'github.com', 'stackoverflow.com', 'wikipedia.org'
]

def extract_urls(text: str) -> List[str]:
    """Extract URLs from text"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(url_pattern, text)

def simulate_detonation(email_subject: str, email_body: str) -> Dict:
    """Simulate sandbox detonation analysis"""
    text = f"{email_subject} {email_body}".lower()
    
    malicious_score = 0
    traces = []
    
    traces.append({
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'action': 'INIT',
        'detail': 'Initializing sandbox environment...'
    })
    
    traces.append({
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'action': 'PARSE',
        'detail': f'Parsing email content ({len(text)} chars)'
    })
    
    urls = extract_urls(email_body)
    if urls:
        for url in urls:
            traces.append({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'action': 'URL_DETECT',
                'detail': f'Found URL: {url}'
            })
            
            is_safe = any(domain in url for domain in SAFE_DOMAINS)
            if not is_safe:
                malicious_score += 15
                traces.append({
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'action': 'ALERT',
                    'detail': f'Suspicious URL detected: {url}'
                })
    
    for indicator in MALICIOUS_INDICATORS:
        if indicator in text:
            malicious_score += 10
            traces.append({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'action': 'INDICATOR',
                'detail': f'Malicious indicator found: "{indicator}"'
            })
    
    attachment_keywords = ['attachment', 'file', 'download', 'open']
    if any(keyword in text for keyword in attachment_keywords):
        if any(ext in text for ext in ['.exe', '.scr', '.bat', '.vbs']):
            malicious_score += 30
            traces.append({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'action': 'CRITICAL',
                'detail': 'Executable attachment detected - HIGH RISK'
            })
    
    if 'script' in text or 'javascript' in text:
        malicious_score += 20
        traces.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': 'SCRIPT',
            'detail': 'Script execution attempt detected'
        })
    
    traces.append({
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'action': 'ANALYZE',
        'detail': 'Running behavioral analysis...'
    })
    
    if random.random() < 0.3:
        traces.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': 'NETWORK',
            'detail': f'Outbound connection attempt to {random.choice(["192.168.1.1", "10.0.0.5", "suspicious-domain.ru"])}'
        })
        malicious_score += 15
    
    final_score = min(malicious_score, 100) / 100.0
    
    verdict = 'CLEAN' if final_score < 0.3 else 'SUSPICIOUS' if final_score < 0.7 else 'MALICIOUS'
    
    traces.append({
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'action': 'COMPLETE',
        'detail': f'Analysis complete - Verdict: {verdict} (Score: {final_score:.2f})'
    })
    
    return {
        'score': final_score,
        'verdict': verdict,
        'traces': traces,
        'indicators_found': malicious_score // 10
    }
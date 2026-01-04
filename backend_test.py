#!/usr/bin/env python3
"""
S.E.N.T.I.N.E.L. Backend API Testing Suite
Tests all API endpoints and email analysis workflows
"""

import requests
import json
import sys
from datetime import datetime

class SentinelAPITester:
    def __init__(self, base_url="https://phishing-defender.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {'PASS' if success else 'FAIL'}")
        if details:
            print(f"   Details: {details}")

    def test_api_health(self):
        """Test API health check"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False

    def test_email_analysis_clean(self):
        """Test email analysis with clean email"""
        clean_email = {
            "subject": "Meeting scheduled for tomorrow",
            "body": "Hi team, please review the quarterly report I sent earlier. Let me know your thoughts.",
            "sender": "colleague@company.com",
            "recipient": "team@company.com"
        }
        
        try:
            response = requests.post(f"{self.api_url}/email/analyze", json=clean_email, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                ml_score = data.get('ml_score', 0)
                status = data.get('status', '')
                details = f"ML Score: {ml_score:.3f}, Status: {status}"
                
                # Verify clean email logic
                if ml_score < 0.5 and status == "CLEAN":
                    self.log_test("Email Analysis - Clean Email", True, details)
                    return data
                else:
                    self.log_test("Email Analysis - Clean Email", False, f"Unexpected result: {details}")
                    return None
            else:
                self.log_test("Email Analysis - Clean Email", False, f"HTTP {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test("Email Analysis - Clean Email", False, f"Error: {str(e)}")
            return None

    def test_email_analysis_phishing(self):
        """Test email analysis with phishing email"""
        phishing_email = {
            "subject": "Urgent: Your account has been compromised",
            "body": "Click here immediately to verify your identity and avoid account suspension. Download the attached file to secure your account.",
            "sender": "security@suspicious-domain.com",
            "recipient": "victim@company.com"
        }
        
        try:
            response = requests.post(f"{self.api_url}/email/analyze", json=phishing_email, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                ml_score = data.get('ml_score', 0)
                sandbox_score = data.get('sandbox_score')
                status = data.get('status', '')
                details = f"ML Score: {ml_score:.3f}, Sandbox Score: {sandbox_score}, Status: {status}"
                
                # Verify phishing detection logic
                if ml_score >= 0.5 and status in ["SUSPICIOUS", "QUARANTINE"]:
                    self.log_test("Email Analysis - Phishing Email", True, details)
                    return data
                else:
                    self.log_test("Email Analysis - Phishing Email", False, f"Failed to detect phishing: {details}")
                    return None
            else:
                self.log_test("Email Analysis - Phishing Email", False, f"HTTP {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test("Email Analysis - Phishing Email", False, f"Error: {str(e)}")
            return None

    def test_get_emails(self):
        """Test retrieving emails list"""
        try:
            response = requests.get(f"{self.api_url}/emails?limit=10", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                emails = data.get('emails', [])
                count = data.get('count', 0)
                details = f"Retrieved {count} emails"
                self.log_test("Get Emails List", True, details)
                return emails
            else:
                self.log_test("Get Emails List", False, f"HTTP {response.status_code}")
                return []
                
        except Exception as e:
            self.log_test("Get Emails List", False, f"Error: {str(e)}")
            return []

    def test_get_email_by_id(self, email_id):
        """Test retrieving specific email by ID"""
        try:
            response = requests.get(f"{self.api_url}/emails/{email_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                email = data.get('email', {})
                sandbox_logs = data.get('sandbox_logs', [])
                details = f"Email ID: {email.get('id', 'N/A')}, Sandbox logs: {len(sandbox_logs)}"
                self.log_test("Get Email by ID", True, details)
                return data
            else:
                self.log_test("Get Email by ID", False, f"HTTP {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test("Get Email by ID", False, f"Error: {str(e)}")
            return None

    def test_update_email_status(self, email_id):
        """Test updating email status"""
        try:
            update_data = {"status": "CLEAN"}
            response = requests.patch(f"{self.api_url}/emails/{email_id}/status", json=update_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Updated to status: {data.get('new_status', 'N/A')}"
                self.log_test("Update Email Status", True, details)
                return True
            else:
                self.log_test("Update Email Status", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Update Email Status", False, f"Error: {str(e)}")
            return False

    def test_submit_feedback(self, email_id):
        """Test submitting feedback"""
        try:
            feedback_data = {
                "email_id": email_id,
                "is_phishing": True,
                "admin_notes": "Test feedback submission"
            }
            response = requests.post(f"{self.api_url}/feedback", json=feedback_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Feedback submitted for email: {email_id}"
                self.log_test("Submit Feedback", True, details)
                return True
            else:
                self.log_test("Submit Feedback", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Submit Feedback", False, f"Error: {str(e)}")
            return False

    def test_model_retrain_insufficient_data(self):
        """Test model retraining with insufficient data"""
        try:
            response = requests.post(f"{self.api_url}/model/retrain", timeout=15)
            
            # Should fail with 400 if insufficient data
            if response.status_code == 400:
                details = "Correctly rejected - insufficient feedback data"
                self.log_test("Model Retrain - Insufficient Data", True, details)
                return True
            elif response.status_code == 200:
                details = "Retrain succeeded (sufficient data available)"
                self.log_test("Model Retrain - Insufficient Data", True, details)
                return True
            else:
                self.log_test("Model Retrain - Insufficient Data", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Model Retrain - Insufficient Data", False, f"Error: {str(e)}")
            return False

    def test_get_stats(self):
        """Test getting dashboard statistics"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                emails_stats = data.get('emails', {})
                model_stats = data.get('model', {})
                details = f"Total emails: {emails_stats.get('total', 0)}, Model accuracy: {model_stats.get('accuracy', 0):.3f}"
                self.log_test("Get Dashboard Stats", True, details)
                return data
            else:
                self.log_test("Get Dashboard Stats", False, f"HTTP {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test("Get Dashboard Stats", False, f"Error: {str(e)}")
            return None

    def test_model_stats(self):
        """Test getting model statistics"""
        try:
            response = requests.get(f"{self.api_url}/model/stats", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Accuracy: {data.get('accuracy', 0):.3f}, Version: {data.get('version', 'N/A')}"
                self.log_test("Get Model Stats", True, details)
                return data
            else:
                self.log_test("Get Model Stats", False, f"HTTP {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test("Get Model Stats", False, f"Error: {str(e)}")
            return None

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🔍 Starting S.E.N.T.I.N.E.L. Backend API Tests")
        print("=" * 50)
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test email analysis workflows
        clean_result = self.test_email_analysis_clean()
        phishing_result = self.test_email_analysis_phishing()
        
        # Test email management
        emails = self.test_get_emails()
        
        # Test individual email retrieval if we have emails
        if emails and len(emails) > 0:
            test_email_id = emails[0]['id']
            self.test_get_email_by_id(test_email_id)
            self.test_update_email_status(test_email_id)
            self.test_submit_feedback(test_email_id)
        
        # Test statistics endpoints
        self.test_get_stats()
        self.test_model_stats()
        
        # Test model retraining
        self.test_model_retrain_insufficient_data()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = SentinelAPITester()
    success = tester.run_comprehensive_test()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
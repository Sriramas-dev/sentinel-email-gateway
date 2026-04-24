#!/usr/bin/env python3
"""Integration smoke tests for the SENTINEL FastAPI backend."""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import requests


class SentinelAPITester:
    def __init__(self, base_url=None):
        self.base_url = base_url or os.getenv("SENTINEL_API_BASE_URL", "http://localhost:8000")
        self.api_url = f"{self.base_url.rstrip('/')}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        self.tests_run += 1
        if success:
            self.tests_passed += 1

        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat(),
        }
        self.test_results.append(result)

        status_icon = "[PASS]" if success else "[FAIL]"
        print(f"{status_icon} {name}")
        if details:
            print(f"       {details}")

    def test_api_health(self):
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"status={response.status_code}"
            if success:
                details += f", message={response.json().get('message', 'N/A')}"
            self.log_test("API health", success, details)
            return success
        except Exception as exc:
            self.log_test("API health", False, f"error={exc}")
            return False

    def test_email_analysis_clean(self):
        payload = {
            "subject": "Meeting scheduled for tomorrow",
            "body": "Hi team, please review the quarterly report.",
            "sender": "colleague@company.com",
            "recipient": "team@company.com",
        }
        try:
            response = requests.post(f"{self.api_url}/email/analyze", json=payload, timeout=15)
            if response.status_code != 200:
                self.log_test("Analyze clean email", False, f"status={response.status_code}")
                return None

            data = response.json()
            ml_score = data.get("ml_score", 0)
            status = data.get("status", "")
            success = ml_score < 0.5 and status == "CLEAN"
            self.log_test("Analyze clean email", success, f"ml_score={ml_score:.3f}, status={status}")
            return data if success else None
        except Exception as exc:
            self.log_test("Analyze clean email", False, f"error={exc}")
            return None

    def test_email_analysis_phishing(self):
        payload = {
            "subject": "Urgent: verify your account now",
            "body": "Click the attached link now to avoid account suspension.",
            "sender": "security@suspicious-domain.com",
            "recipient": "victim@company.com",
        }
        try:
            response = requests.post(f"{self.api_url}/email/analyze", json=payload, timeout=15)
            if response.status_code != 200:
                self.log_test("Analyze phishing email", False, f"status={response.status_code}")
                return None

            data = response.json()
            ml_score = data.get("ml_score", 0)
            status = data.get("status", "")
            sandbox_score = data.get("sandbox_score")
            success = ml_score >= 0.5 and status in ["SUSPICIOUS", "QUARANTINE"]
            self.log_test(
                "Analyze phishing email",
                success,
                f"ml_score={ml_score:.3f}, sandbox_score={sandbox_score}, status={status}",
            )
            return data if success else None
        except Exception as exc:
            self.log_test("Analyze phishing email", False, f"error={exc}")
            return None

    def test_email_analyze_validation(self):
        invalid_payload = {
            "subject": "   ",
            "body": "   ",
            "sender": "   ",
            "recipient": "user@example.com",
        }
        try:
            response = requests.post(f"{self.api_url}/email/analyze", json=invalid_payload, timeout=10)
            success = response.status_code in (400, 422)
            self.log_test("Analyze validation (blank fields)", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("Analyze validation (blank fields)", False, f"error={exc}")
            return False

    def test_get_emails(self):
        try:
            response = requests.get(f"{self.api_url}/emails?limit=10", timeout=10)
            if response.status_code != 200:
                self.log_test("List emails", False, f"status={response.status_code}")
                return []
            data = response.json()
            emails = data.get("emails", [])
            self.log_test("List emails", True, f"count={data.get('count', 0)}")
            return emails
        except Exception as exc:
            self.log_test("List emails", False, f"error={exc}")
            return []

    def test_get_emails_limit_validation(self):
        try:
            response = requests.get(f"{self.api_url}/emails?limit=0", timeout=10)
            success = response.status_code == 422
            self.log_test("List emails validation (limit=0)", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("List emails validation (limit=0)", False, f"error={exc}")
            return False

    def test_get_email_by_id(self, email_id):
        try:
            response = requests.get(f"{self.api_url}/emails/{email_id}", timeout=10)
            if response.status_code != 200:
                self.log_test("Get email by id", False, f"status={response.status_code}")
                return None
            data = response.json()
            details = f"id={data.get('email', {}).get('id', 'N/A')}, logs={len(data.get('sandbox_logs', []))}"
            self.log_test("Get email by id", True, details)
            return data
        except Exception as exc:
            self.log_test("Get email by id", False, f"error={exc}")
            return None

    def test_get_email_by_id_not_found(self):
        fake_email_id = "00000000-0000-0000-0000-000000000000"
        try:
            response = requests.get(f"{self.api_url}/emails/{fake_email_id}", timeout=10)
            success = response.status_code == 404
            self.log_test("Get email by id (not found)", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("Get email by id (not found)", False, f"error={exc}")
            return False

    def test_update_email_status(self, email_id):
        try:
            response = requests.patch(
                f"{self.api_url}/emails/{email_id}/status",
                json={"status": "CLEAN"},
                timeout=10,
            )
            success = response.status_code == 200
            new_status = response.json().get("new_status", "N/A") if success else "N/A"
            self.log_test("Update email status", success, f"status={response.status_code}, new_status={new_status}")
            return success
        except Exception as exc:
            self.log_test("Update email status", False, f"error={exc}")
            return False

    def test_update_email_status_validation(self, email_id):
        try:
            response = requests.patch(
                f"{self.api_url}/emails/{email_id}/status",
                json={"status": "BLOCKED"},
                timeout=10,
            )
            success = response.status_code == 422
            self.log_test("Update status validation (invalid value)", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("Update status validation (invalid value)", False, f"error={exc}")
            return False

    def test_submit_feedback(self, email_id):
        payload = {"email_id": email_id, "is_phishing": True, "admin_notes": "Integration smoke test feedback"}
        try:
            response = requests.post(f"{self.api_url}/feedback", json=payload, timeout=10)
            success = response.status_code == 200
            self.log_test("Submit feedback", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("Submit feedback", False, f"error={exc}")
            return False

    def test_model_retrain_insufficient_data(self):
        try:
            response = requests.post(f"{self.api_url}/model/retrain", timeout=15)
            success = response.status_code in (200, 400)
            self.log_test("Retrain model", success, f"status={response.status_code}")
            return success
        except Exception as exc:
            self.log_test("Retrain model", False, f"error={exc}")
            return False

    def test_get_stats(self):
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            if response.status_code != 200:
                self.log_test("Get dashboard stats", False, f"status={response.status_code}")
                return None
            data = response.json()
            emails_stats = data.get("emails", {})
            model_stats = data.get("model", {})
            details = f"total={emails_stats.get('total', 0)}, accuracy={model_stats.get('accuracy', 0):.3f}"
            self.log_test("Get dashboard stats", True, details)
            return data
        except Exception as exc:
            self.log_test("Get dashboard stats", False, f"error={exc}")
            return None

    def test_model_stats(self):
        try:
            response = requests.get(f"{self.api_url}/model/stats", timeout=10)
            if response.status_code != 200:
                self.log_test("Get model stats", False, f"status={response.status_code}")
                return None
            data = response.json()
            details = f"accuracy={data.get('accuracy', 0):.3f}, version={data.get('version', 'N/A')}"
            self.log_test("Get model stats", True, details)
            return data
        except Exception as exc:
            self.log_test("Get model stats", False, f"error={exc}")
            return None

    def run_comprehensive_test(self):
        print(f"Running backend API integration suite against: {self.base_url}")
        print("=" * 70)

        if not self.test_api_health():
            print("API is not accessible, stopping suite.")
            return False

        self.test_email_analysis_clean()
        self.test_email_analysis_phishing()
        self.test_email_analyze_validation()

        emails = self.test_get_emails()
        self.test_get_emails_limit_validation()
        self.test_get_email_by_id_not_found()

        if emails:
            test_email_id = emails[0]["id"]
            self.test_get_email_by_id(test_email_id)
            self.test_update_email_status(test_email_id)
            self.test_update_email_status_validation(test_email_id)
            self.test_submit_feedback(test_email_id)

        self.test_get_stats()
        self.test_model_stats()
        self.test_model_retrain_insufficient_data()

        print("\n" + "=" * 70)
        print(f"Test summary: {self.tests_passed}/{self.tests_run} passed")
        return self.tests_passed == self.tests_run

    def save_report(self):
        repo_root = Path(__file__).resolve().parent
        reports_dir = repo_root / "test_reports"
        reports_dir.mkdir(parents=True, exist_ok=True)

        report = {
            "summary": {
                "total_tests": self.tests_run,
                "passed_tests": self.tests_passed,
                "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run else 0,
                "timestamp": datetime.now().isoformat(),
                "base_url": self.base_url,
            },
            "detailed_results": self.test_results,
        }

        latest_path = reports_dir / "backend_test_results.json"
        with latest_path.open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)

        history_name = f"backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with (reports_dir / history_name).open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)


def main():
    tester = SentinelAPITester()
    success = tester.run_comprehensive_test()
    tester.save_report()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
# SENTINEL Testing Summary

This document tracks practical test coverage and execution guidance for the repository.

## Test Suites

### 1) Backend API integration smoke tests
- **File:** `backend_test.py`
- **Purpose:** Validate critical API workflows against a running backend instance.
- **Coverage includes:**
  - API health endpoint
  - Email analysis (clean + phishing)
  - Validation checks (blank analyze payload, invalid list limit, invalid status update)
  - Email listing and retrieval
  - Feedback submission
  - Dashboard and model stats endpoints
  - Model retrain endpoint behavior
- **Output:** JSON reports under `test_reports/`.

### 2) Backend unit tests
- **File:** `tests/test_validation.py`
- **Purpose:** Ensure status normalization/validation logic remains consistent.
- **Coverage includes:**
  - accepted values normalization (`clean`, `suspicious`, `quarantine`)
  - invalid status rejection

## How to run tests

From repository root:

```bash
python backend_test.py
python -m pytest -q tests
```

## Latest known status

- Integration report example is available at `test_reports/backend_test_results.json`.
- Unit tests depend on `pytest` being installed in the active Python environment.

## Maintenance notes

- Keep this file as a concise human-readable summary.
- Store machine-readable run artifacts in `test_reports/`.
- Do not embed transient agent/tooling protocol logs in this file.
from backend.validation import normalize_status


def test_normalize_status_accepts_valid_values():
    assert normalize_status("clean") == "CLEAN"
    assert normalize_status(" suspicious ") == "SUSPICIOUS"
    assert normalize_status("QUARANTINE") == "QUARANTINE"


def test_normalize_status_rejects_unknown_values():
    try:
        normalize_status("blocked")
        assert False, "normalize_status should reject unsupported status values"
    except ValueError as exc:
        assert "status must be one of" in str(exc)
from backend.validation import normalize_status


def test_normalize_status_accepts_valid_values():
    assert normalize_status("clean") == "CLEAN"
    assert normalize_status(" suspicious ") == "SUSPICIOUS"
    assert normalize_status("QUARANTINE") == "QUARANTINE"


def test_normalize_status_rejects_unknown_values():
    try:
        normalize_status("blocked")
        assert False, "normalize_status should reject unsupported status values"
    except ValueError as exc:
        assert "status must be one of" in str(exc)

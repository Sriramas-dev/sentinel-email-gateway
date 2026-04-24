"""Reusable validation helpers for API inputs."""

from typing import Any

VALID_EMAIL_STATUSES = {"CLEAN", "SUSPICIOUS", "QUARANTINE"}


def normalize_status(value: Any) -> str:
    """Normalize and validate supported email statuses."""
    normalized = str(value).strip().upper()
    if normalized not in VALID_EMAIL_STATUSES:
        allowed = ", ".join(sorted(VALID_EMAIL_STATUSES))
        raise ValueError(f"status must be one of: {allowed}")
    return normalized

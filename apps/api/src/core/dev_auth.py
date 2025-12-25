"""
Development authentication bypass.

This module provides a way to bypass Clerk authentication during local development.
DO NOT use in production.

Usage:
    Set environment variable: ENVIRONMENT=development
    Use header: Authorization: Bearer dev_<clerk_user_id>

Example:
    Authorization: Bearer dev_user_seed_001
"""

import structlog

from src.core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

DEV_TOKEN_PREFIX = "dev_"


def is_dev_token(token: str) -> bool:
    """Check if the token is a development bypass token."""
    return settings.is_development and token.startswith(DEV_TOKEN_PREFIX)


def extract_dev_user_id(token: str) -> str | None:
    """
    Extract user ID from development token.

    Args:
        token: Token string like "dev_user_seed_001"

    Returns:
        Clerk user ID (e.g., "user_seed_001") or None if not a dev token
    """
    if not is_dev_token(token):
        return None

    # Remove the "dev_" prefix to get the clerk_user_id
    return token[len(DEV_TOKEN_PREFIX):]


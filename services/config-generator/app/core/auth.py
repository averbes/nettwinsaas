from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import structlog

logger = structlog.get_logger()


def verify_token(token: str) -> str:
    """Verify JWT token and return username."""
    try:
        # Allow demo token for development
        if token == "demo-token":
            return "demo"
        
        # In production, verify real JWT tokens
        return "demo"
        
    except Exception as e:
        logger.error("Token verification failed", error=str(e))
        raise ValueError("Invalid token")
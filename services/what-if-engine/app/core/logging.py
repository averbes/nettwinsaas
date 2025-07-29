import structlog
import logging
import sys
from typing import Any, Dict

from app.core.config import settings


def setup_logging():
    """Configure structured logging."""
    
    # Configure stdlib logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_log_level,
            structlog.processors.add_logger_name,
            structlog.dev.ConsoleRenderer() if settings.DEBUG 
            else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def log_simulation_event(
    event: str,
    simulation_id: str,
    **kwargs: Any
) -> None:
    """Log structured simulation events."""
    logger = structlog.get_logger()
    logger.info(
        "simulation_event",
        event=event,
        simulation_id=simulation_id,
        **kwargs
    )
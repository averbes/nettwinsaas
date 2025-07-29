from functools import lru_cache
from typing import Dict, Any
import redis
import clickhouse_connect
import structlog

from app.core.config import settings

logger = structlog.get_logger()


@lru_cache()
def get_database_connections() -> Dict[str, Any]:
    """Get database connections (cached)."""
    
    connections = {}
    
    try:
        # Redis connection
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        connections["redis"] = redis_client
        logger.info("Redis connection established")
        
        # ClickHouse connection
        clickhouse_client = clickhouse_connect.get_client(
            host=settings.CLICKHOUSE_HOST,
            port=settings.CLICKHOUSE_PORT,
            database=settings.CLICKHOUSE_DB,
            username=settings.CLICKHOUSE_USER,
            password=settings.CLICKHOUSE_PASSWORD,
        )
        connections["clickhouse"] = clickhouse_client
        logger.info("ClickHouse connection established")
        
        return connections
        
    except Exception as e:
        logger.error("Failed to establish database connections", error=str(e))
        raise
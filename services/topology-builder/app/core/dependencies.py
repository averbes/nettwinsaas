from functools import lru_cache
from typing import Dict, Any
import redis
from neo4j import GraphDatabase
import structlog

from app.core.config import settings

logger = structlog.get_logger()


@lru_cache()
def get_database_connections() -> Dict[str, Any]:
    """Get database connections (cached)."""
    
    connections = {}
    
    try:
        # Neo4j connection
        neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            database="neo4j"
        )
        connections["neo4j"] = neo4j_driver
        logger.info("Neo4j connection established")
        
        # Redis connection
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        connections["redis"] = redis_client
        logger.info("Redis connection established")
        
        return connections
        
    except Exception as e:
        logger.error("Failed to establish database connections", error=str(e))
        raise
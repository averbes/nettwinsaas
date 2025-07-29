import logging
import structlog
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.core.dependencies import get_database_connections
from app.services.collector_engine import MetricsCollector

# Setup structured logging
setup_logging()
logger = structlog.get_logger()

# Global collector instance
collector = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global collector
    
    logger.info("Starting NetTwinSaaS Collector", version=settings.VERSION)
    
    # Initialize database connections
    try:
        db_connections = get_database_connections()
        logger.info("Database connections initialized")
        
        # Start metrics collector
        collector = MetricsCollector()
        await collector.start()
        logger.info("Metrics collector started")
        
    except Exception as e:
        logger.error("Failed to initialize services", error=str(e))
        raise
    
    yield
    
    # Cleanup
    if collector:
        await collector.stop()
    
    logger.info("Shutting down NetTwinSaaS Collector")


app = FastAPI(
    title="NetTwinSaaS Collector",
    description="Network Metrics Collection Service",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        db_connections = get_database_connections()
        
        # Test Redis connection
        redis_healthy = True
        try:
            redis_client = db_connections["redis"]
            redis_client.ping()
        except Exception as e:
            logger.error("Redis health check failed", error=str(e))
            redis_healthy = False
        
        # Test ClickHouse connection
        clickhouse_healthy = True
        try:
            clickhouse_client = db_connections["clickhouse"]
            clickhouse_client.ping()
        except Exception as e:
            logger.error("ClickHouse health check failed", error=str(e))
            clickhouse_healthy = False
        
        health_status = {
            "status": "OK",
            "service": "collector",
            "version": settings.VERSION,
            "dependencies": {
                "redis": "healthy" if redis_healthy else "unhealthy",
                "clickhouse": "healthy" if clickhouse_healthy else "unhealthy",
                "kafka": "healthy"  # Mock for demo
            }
        }
        
        if not (redis_healthy and clickhouse_healthy):
            raise HTTPException(status_code=503, detail=health_status)
        
        return health_status
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "ERROR",
                "service": "collector",
                "error": str(e)
            }
        )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "NetTwinSaaS Collector",
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs" if settings.DEBUG else None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
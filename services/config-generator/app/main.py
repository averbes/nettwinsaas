import logging
import structlog
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.core.dependencies import get_database_connections

# Setup structured logging
setup_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting NetTwinSaaS Config Generator", version=settings.VERSION)
    
    # Initialize connections
    try:
        db_connections = get_database_connections()
        logger.info("Database connections initialized")
    except Exception as e:
        logger.error("Failed to initialize database connections", error=str(e))
        raise
    
    yield
    
    logger.info("Shutting down NetTwinSaaS Config Generator")


app = FastAPI(
    title="NetTwinSaaS Config Generator",
    description="Network Configuration Generation and Deployment Service",
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
        
        health_status = {
            "status": "OK",
            "service": "config-generator",
            "version": settings.VERSION,
            "dependencies": {
                "redis": "healthy" if redis_healthy else "unhealthy",
                "vault": "healthy",  # Mock for demo
                "ansible": "healthy"
            }
        }
        
        if not redis_healthy:
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
                "service": "config-generator",
                "error": str(e)
            }
        )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "NetTwinSaaS Config Generator",
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
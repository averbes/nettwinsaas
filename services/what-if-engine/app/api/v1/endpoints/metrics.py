from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from typing import Optional
import structlog

from app.models.simulation import NetworkMetrics
from app.core.auth import verify_token
from app.core.dependencies import get_clickhouse_client

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger()


@router.get("/system", response_model=dict)
async def get_system_metrics(token: str = Depends(security)):
    """Get system metrics."""
    try:
        verify_token(token.credentials)
        
        # Return mock system metrics
        return {
            "cpu_usage": 45.2,
            "memory_usage": 68.7,
            "disk_usage": 34.1,
            "active_simulations": 2,
            "completed_simulations": 156,
            "uptime_seconds": 86400,
            "version": "1.0.0"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to get system metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get system metrics")


@router.get("/network", response_model=NetworkMetrics)
async def get_network_metrics(
    time_range: Optional[str] = "1h",
    token: str = Depends(security)
):
    """Get network metrics."""
    try:
        verify_token(token.credentials)
        
        # Return mock network metrics
        return NetworkMetrics(
            total_nodes=5,
            total_links=7,
            average_utilization=0.54,
            peak_utilization=0.85,
            available_capacity=2500,
            total_capacity=6000,
            active_flows=127
        )
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to get network metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get network metrics")
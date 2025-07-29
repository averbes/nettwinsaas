from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer
import structlog

from app.models.topology import DiscoveryRequest, DiscoveryResult
from app.services.discovery_engine import NetworkDiscoverer
from app.core.auth import verify_token

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger()


@router.post("/discover", response_model=DiscoveryResult)
async def start_discovery(
    request: DiscoveryRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(security)
):
    """Start network topology discovery."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        discoverer = NetworkDiscoverer()
        result = await discoverer.discover_network(request)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Discovery failed", error=str(e))
        raise HTTPException(status_code=500, detail="Discovery failed")


@router.get("/discovery/{discovery_id}/status", response_model=Optional[DiscoveryResult])
async def get_discovery_status(
    discovery_id: str,
    token: str = Depends(security)
):
    """Get discovery status."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        discoverer = NetworkDiscoverer()
        result = await discoverer.get_discovery_status(discovery_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Discovery not found")
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get discovery status", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get discovery status")


@router.delete("/discovery/{discovery_id}")
async def cancel_discovery(
    discovery_id: str,
    token: str = Depends(security)
):
    """Cancel running discovery."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        # TODO: Implement discovery cancellation
        return {"message": "Discovery cancelled", "discovery_id": discovery_id}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to cancel discovery", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to cancel discovery")
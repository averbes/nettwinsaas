from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
import structlog

from app.models.topology import NetworkTopology
from app.services.discovery_engine import NetworkDiscoverer
from app.core.auth import verify_token

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger()


@router.get("/topology", response_model=NetworkTopology)
async def get_network_topology(token: str = Depends(security)):
    """Get current network topology."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        discoverer = NetworkDiscoverer()
        topology = await discoverer.get_network_topology()
        
        return topology
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to get network topology", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get network topology")


@router.get("/topology/nodes")
async def get_network_nodes(token: str = Depends(security)):
    """Get network nodes only."""
    try:
        verify_token(token.credentials)
        
        discoverer = NetworkDiscoverer()
        topology = await discoverer.get_network_topology()
        
        return {
            "nodes": topology.nodes,
            "count": len(topology.nodes)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to get network nodes", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get network nodes")


@router.get("/topology/links")
async def get_network_links(token: str = Depends(security)):
    """Get network links only."""
    try:
        verify_token(token.credentials)
        
        discoverer = NetworkDiscoverer()
        topology = await discoverer.get_network_topology()
        
        return {
            "links": topology.links,
            "count": len(topology.links)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to get network links", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get network links")
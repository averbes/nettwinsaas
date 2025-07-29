from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
import structlog

from app.models.simulation import SimulationRequest, SimulationResult
from app.services.simulation_engine import NetworkSimulator
from app.core.auth import verify_token

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger()


@router.post("/simulate", response_model=SimulationResult)
async def run_simulation(
    request: SimulationRequest,
    token: str = Depends(security)
):
    """Run network simulation."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        simulator = NetworkSimulator()
        result = await simulator.simulate(request)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Simulation failed", error=str(e))
        raise HTTPException(status_code=500, detail="Simulation failed")


@router.get("/simulation/{simulation_id}/results", response_model=Optional[SimulationResult])
async def get_simulation_results(
    simulation_id: str,
    token: str = Depends(security)
):
    """Get simulation results."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        simulator = NetworkSimulator()
        result = await simulator.get_simulation_result(simulation_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to retrieve simulation results", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve results")


@router.get("/simulations")
async def list_simulations(
    limit: int = 10,
    offset: int = 0,
    token: str = Depends(security)
):
    """List recent simulations."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        # TODO: Implement pagination and filtering
        return {
            "simulations": [],
            "total": 0,
            "limit": limit,
            "offset": offset
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to list simulations", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to list simulations")


@router.delete("/simulation/{simulation_id}")
async def cancel_simulation(
    simulation_id: str,
    token: str = Depends(security)
):
    """Cancel running simulation."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        # TODO: Implement simulation cancellation
        return {"message": "Simulation cancelled", "simulation_id": simulation_id}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to cancel simulation", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to cancel simulation")
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.security import HTTPBearer
import structlog

from app.models.config import ConfigGenerationRequest, ConfigJob
from app.services.config_engine import ConfigurationEngine
from app.core.auth import verify_token

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger()


@router.post("/generate", response_model=ConfigJob)
async def generate_configurations(
    request: ConfigGenerationRequest,
    token: str = Depends(security)
):
    """Generate network configurations."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        engine = ConfigurationEngine()
        job = await engine.generate_configurations(request)
        
        return job
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Configuration generation failed", error=str(e))
        raise HTTPException(status_code=500, detail="Configuration generation failed")


@router.get("/job/{job_id}/status", response_model=Optional[ConfigJob])
async def get_config_job_status(
    job_id: str,
    token: str = Depends(security)
):
    """Get configuration job status."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        engine = ConfigurationEngine()
        job = await engine.get_config_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Configuration job not found")
        
        return job
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get config job status", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get config job status")


@router.get("/job/{job_id}/download")
async def download_configurations(
    job_id: str,
    token: str = Depends(security)
):
    """Download generated configurations."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        engine = ConfigurationEngine()
        job = await engine.get_config_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Configuration job not found")
        
        if job.status.value != "completed":
            raise HTTPException(status_code=400, detail="Job not completed")
        
        # Return configurations as zip file content
        # For demo, return as text
        configs_text = "\n\n".join([
            f"=== {device} ===\n{config}"
            for device, config in job.generated_configs.items()
        ])
        
        return Response(
            content=configs_text,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=configs_{job_id}.txt"}
        )
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to download configurations", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to download configurations")


@router.delete("/job/{job_id}")
async def cancel_config_job(
    job_id: str,
    token: str = Depends(security)
):
    """Cancel configuration job."""
    try:
        # Verify authentication
        verify_token(token.credentials)
        
        # TODO: Implement job cancellation
        return {"message": "Configuration job cancelled", "job_id": job_id}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error("Failed to cancel config job", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to cancel config job")
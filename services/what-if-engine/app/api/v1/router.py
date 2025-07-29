from fastapi import APIRouter
from app.api.v1.endpoints import simulation, metrics, auth

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(simulation.router, tags=["simulation"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
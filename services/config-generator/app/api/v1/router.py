from fastapi import APIRouter
from app.api.v1.endpoints import config, deployment

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(config.router, tags=["configuration"])
api_router.include_router(deployment.router, tags=["deployment"])
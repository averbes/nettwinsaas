from fastapi import APIRouter
from app.api.v1.endpoints import discovery, topology

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(discovery.router, tags=["discovery"])
api_router.include_router(topology.router, tags=["topology"])
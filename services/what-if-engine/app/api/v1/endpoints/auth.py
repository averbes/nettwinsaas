from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import structlog

from app.core.auth import create_access_token, verify_password

router = APIRouter()
logger = structlog.get_logger()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login endpoint."""
    try:
        # Simple demo authentication
        if request.username == "demo" and request.password == "demo":
            access_token = create_access_token(data={"sub": request.username})
            return LoginResponse(access_token=access_token)
        
        # In production, verify against real user database
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login failed", error=str(e))
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/refresh")
async def refresh_token():
    """Refresh access token."""
    # TODO: Implement token refresh logic
    return {"message": "Token refresh not implemented"}
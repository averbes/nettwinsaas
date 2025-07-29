from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "NetTwinSaaS Config Generator"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Security
    JWT_SECRET: str = "your-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    
    # Database connections
    REDIS_URL: str = "redis://localhost:6379"
    
    # External services
    VAULT_URL: str = "http://localhost:8200"
    VAULT_TOKEN: str = "dev-token"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
    ]
    
    # Ansible settings
    ANSIBLE_PLAYBOOK_DIR: str = "/app/playbooks"
    ANSIBLE_HOST_KEY_CHECKING: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
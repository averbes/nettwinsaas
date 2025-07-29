from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import uuid


class ConfigType(str, Enum):
    """Configuration type enumeration."""
    QOS = "qos"
    ROUTING = "routing"
    SECURITY = "security"
    INTERFACE = "interface"
    VLAN = "vlan"
    VPN = "vpn"


class JobStatus(str, Enum):
    """Job status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ConfigGenerationRequest(BaseModel):
    """Configuration generation request."""
    simulation_id: str
    targets: List[str]  # List of device IDs
    config_type: ConfigType = ConfigType.QOS
    dry_run: bool = True
    priority: str = "medium"  # low, medium, high
    parameters: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            ConfigType: lambda v: v.value
        }


class ConfigJob(BaseModel):
    """Configuration generation job."""
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: JobStatus = JobStatus.PENDING
    request: ConfigGenerationRequest
    generated_configs: Dict[str, str] = Field(default_factory=dict)
    ansible_playbook: Optional[str] = None
    errors: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            JobStatus: lambda v: v.value
        }


class DeploymentRequest(BaseModel):
    """Configuration deployment request."""
    job_id: str
    targets: List[str]
    rollback_on_error: bool = True
    confirmation_required: bool = False
    backup_configs: bool = True


class DeploymentResult(BaseModel):
    """Configuration deployment result."""
    deployment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    status: str = "pending"
    results: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    rollback_performed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
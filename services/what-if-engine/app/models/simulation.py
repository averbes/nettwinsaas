from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid
from datetime import datetime


class SimulationAction(str, Enum):
    """Simulation action types."""
    ADD_LINK = "add_link"
    REMOVE_LINK = "remove_link"
    CHANGE_CAPACITY = "change_capacity"
    ADD_NODE = "add_node"
    REMOVE_NODE = "remove_node"
    CHANGE_QOS = "change_qos"


class SimulationStatus(str, Enum):
    """Simulation status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SimulationRequest(BaseModel):
    """Simulation request model."""
    action: SimulationAction
    src: Optional[str] = None
    dst: Optional[str] = None
    capacity: Optional[int] = None
    latency: Optional[float] = None
    cost: Optional[int] = None
    node_id: Optional[str] = None
    qos_class: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            SimulationAction: lambda v: v.value
        }


class ImpactAnalysis(BaseModel):
    """Impact analysis results."""
    affected_paths: List[str] = Field(default_factory=list)
    congested_links: List[str] = Field(default_factory=list)
    packet_loss: float = 0.0
    latency_increase: float = 0.0
    redundancy_impact: str = "none"
    risk_level: str = "low"
    recommendations: List[str] = Field(default_factory=list)


class SimulationResult(BaseModel):
    """Simulation result model."""
    simulation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: SimulationStatus = SimulationStatus.PENDING
    request: SimulationRequest
    impact_analysis: Optional[ImpactAnalysis] = None
    execution_time: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            SimulationStatus: lambda v: v.value,
            SimulationAction: lambda v: v.value
        }


class NetworkMetrics(BaseModel):
    """Network metrics model."""
    total_nodes: int = 0
    total_links: int = 0
    average_utilization: float = 0.0
    peak_utilization: float = 0.0
    available_capacity: int = 0
    total_capacity: int = 0
    active_flows: int = 0
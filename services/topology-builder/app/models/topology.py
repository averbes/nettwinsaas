from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import uuid


class DiscoveryStatus(str, Enum):
    """Discovery status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DiscoveryType(str, Enum):
    """Discovery type enumeration."""
    FULL = "full"
    INCREMENTAL = "incremental"
    TARGETED = "targeted"


class NodeType(str, Enum):
    """Node type enumeration."""
    ROUTER = "router"
    SWITCH = "switch"
    HOST = "host"
    GATEWAY = "gateway"
    FIREWALL = "firewall"


class Node(BaseModel):
    """Network node model."""
    id: str
    name: str
    type: NodeType
    ip_address: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    version: Optional[str] = None
    location: Optional[str] = None
    interfaces: Dict[str, Any] = Field(default_factory=dict)
    properties: Dict[str, Any] = Field(default_factory=dict)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            NodeType: lambda v: v.value
        }


class Link(BaseModel):
    """Network link model."""
    id: str
    source: str
    target: str
    interface_src: Optional[str] = None
    interface_dst: Optional[str] = None
    capacity: Optional[int] = None  # in Mbps
    utilization: float = 0.0
    latency: Optional[float] = None  # in ms
    cost: Optional[int] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DiscoveryRequest(BaseModel):
    """Network discovery request."""
    network_range: str
    discovery_type: DiscoveryType = DiscoveryType.FULL
    protocols: List[str] = Field(default_factory=lambda: ["snmp", "lldp"])
    depth: int = 3
    include_hosts: bool = False
    snmp_community: Optional[str] = None
    
    class Config:
        json_encoders = {
            DiscoveryType: lambda v: v.value
        }


class DiscoveryResult(BaseModel):
    """Discovery result model."""
    discovery_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: DiscoveryStatus = DiscoveryStatus.PENDING
    request: DiscoveryRequest
    nodes_discovered: int = 0
    links_discovered: int = 0
    errors: List[str] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            DiscoveryStatus: lambda v: v.value
        }


class NetworkTopology(BaseModel):
    """Complete network topology."""
    nodes: List[Node] = Field(default_factory=list)
    links: List[Link] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
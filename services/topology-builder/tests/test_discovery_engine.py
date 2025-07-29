import pytest
import asyncio
from unittest.mock import MagicMock, patch

from app.services.discovery_engine import NetworkDiscoverer
from app.models.topology import DiscoveryRequest, DiscoveryType, DiscoveryStatus


@pytest.fixture
def mock_connections():
    """Mock database connections."""
    mock_neo4j = MagicMock()
    mock_redis = MagicMock()
    mock_redis.get.return_value = None
    mock_redis.setex.return_value = True
    
    return {
        "neo4j": mock_neo4j,
        "redis": mock_redis
    }


@pytest.fixture
def discoverer(mock_connections, monkeypatch):
    """Create NetworkDiscoverer with mocked dependencies."""
    monkeypatch.setattr(
        "app.services.discovery_engine.get_database_connections",
        lambda: mock_connections
    )
    return NetworkDiscoverer()


@pytest.mark.asyncio
async def test_discover_network(discoverer):
    """Test network discovery."""
    request = DiscoveryRequest(
        network_range="192.168.1.0/24",
        discovery_type=DiscoveryType.FULL
    )
    
    result = await discoverer.discover_network(request)
    
    assert result.discovery_id is not None
    assert result.status in [DiscoveryStatus.RUNNING, DiscoveryStatus.PENDING]
    assert result.request.network_range == "192.168.1.0/24"


def test_generate_synthetic_topology(discoverer):
    """Test synthetic topology generation."""
    request = DiscoveryRequest(
        network_range="192.168.1.0/24",
        discovery_type=DiscoveryType.FULL
    )
    
    nodes, links = discoverer._generate_synthetic_topology(request)
    
    assert len(nodes) >= 5
    assert len(links) >= 5
    
    # Check node properties
    for node in nodes:
        assert node.name.startswith("R")
        assert node.ip_address is not None
        assert node.vendor is not None
    
    # Check link properties
    for link in links:
        assert link.source in [n.id for n in nodes]
        assert link.target in [n.id for n in nodes]
        assert link.capacity > 0


@pytest.mark.asyncio
async def test_save_topology_to_neo4j(discoverer, mock_connections):
    """Test saving topology to Neo4j."""
    from app.models.topology import Node, Link, NodeType
    
    nodes = [
        Node(id="R1", name="R1", type=NodeType.ROUTER, ip_address="192.168.1.1")
    ]
    links = [
        Link(id="L1", source="R1", target="R2", capacity=1000)
    ]
    
    # Mock Neo4j session
    mock_session = MagicMock()
    mock_connections["neo4j"].session.return_value.__enter__.return_value = mock_session
    
    await discoverer._save_topology_to_neo4j(nodes, links)
    
    # Verify Neo4j calls were made
    assert mock_session.run.call_count >= 2  # At least one for nodes, one for links


@pytest.mark.asyncio
async def test_get_discovery_status_not_found(discoverer, mock_connections):
    """Test getting status for non-existent discovery."""
    mock_connections["redis"].get.return_value = None
    
    result = await discoverer.get_discovery_status("nonexistent-id")
    
    assert result is None


@pytest.mark.asyncio
async def test_get_network_topology_empty(discoverer, mock_connections):
    """Test getting empty network topology."""
    # Mock empty Neo4j result
    mock_session = MagicMock()
    mock_session.run.return_value = []
    mock_connections["neo4j"].session.return_value.__enter__.return_value = mock_session
    
    topology = await discoverer.get_network_topology()
    
    assert len(topology.nodes) == 0
    assert len(topology.links) == 0
    assert topology.metadata is not None
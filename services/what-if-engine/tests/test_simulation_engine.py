import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
import networkx as nx

from app.services.simulation_engine import NetworkSimulator
from app.models.simulation import SimulationRequest, SimulationAction, SimulationStatus


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(return_value=True)
    mock_redis.get = AsyncMock(return_value=None)
    mock_redis.setex = AsyncMock(return_value=True)
    return mock_redis


@pytest.fixture 
def mock_neo4j():
    """Mock Neo4j driver."""
    mock_driver = MagicMock()
    mock_driver.verify_connectivity = MagicMock(return_value=True)
    return mock_driver


@pytest.fixture
def simulator(mock_redis, mock_neo4j, monkeypatch):
    """Create NetworkSimulator with mocked dependencies."""
    monkeypatch.setattr(
        "app.services.simulation_engine.get_redis_client",
        lambda: mock_redis
    )
    monkeypatch.setattr(
        "app.services.simulation_engine.get_neo4j_driver", 
        lambda: mock_neo4j
    )
    return NetworkSimulator()


@pytest.mark.asyncio
async def test_simulate_add_link(simulator):
    """Test simulating adding a link."""
    request = SimulationRequest(
        action=SimulationAction.ADD_LINK,
        src="R1",
        dst="R3", 
        capacity=1000
    )
    
    result = await simulator.simulate(request)
    
    assert result.status == SimulationStatus.COMPLETED
    assert result.simulation_id is not None
    assert result.impact_analysis is not None
    assert result.execution_time > 0
    assert result.request.action == SimulationAction.ADD_LINK


@pytest.mark.asyncio
async def test_simulate_remove_link(simulator):
    """Test simulating removing a link."""
    request = SimulationRequest(
        action=SimulationAction.REMOVE_LINK,
        src="R1",
        dst="R2"
    )
    
    result = await simulator.simulate(request)
    
    assert result.status == SimulationStatus.COMPLETED
    assert result.impact_analysis is not None
    assert result.impact_analysis.risk_level in ["low", "medium", "high", "critical"]


@pytest.mark.asyncio
async def test_simulate_change_capacity(simulator):
    """Test simulating capacity change."""
    request = SimulationRequest(
        action=SimulationAction.CHANGE_CAPACITY,
        src="R1",
        dst="R2",
        capacity=2000
    )
    
    result = await simulator.simulate(request)
    
    assert result.status == SimulationStatus.COMPLETED
    assert result.impact_analysis is not None


def test_generate_synthetic_topology(simulator):
    """Test synthetic topology generation."""
    graph = simulator._generate_synthetic_topology()
    
    assert isinstance(graph, nx.Graph)
    assert len(graph.nodes()) >= 5
    assert len(graph.edges()) >= 5
    
    # Check that nodes have expected attributes
    for node in graph.nodes():
        assert isinstance(node, str)
        assert node.startswith("R")
    
    # Check that edges have expected attributes
    for _, _, attrs in graph.edges(data=True):
        assert "capacity" in attrs
        assert "utilization" in attrs
        assert "latency" in attrs


def test_apply_simulation_changes_add_link(simulator):
    """Test applying add link changes."""
    graph = simulator._generate_minimal_topology()
    request = SimulationRequest(
        action=SimulationAction.ADD_LINK,
        src="R1",
        dst="R4",
        capacity=1500
    )
    
    modified_graph = simulator._apply_simulation_changes(graph, request)
    
    assert modified_graph.has_edge("R1", "R4")
    assert modified_graph["R1"]["R4"]["capacity"] == 1500


def test_apply_simulation_changes_remove_link(simulator):
    """Test applying remove link changes."""
    graph = simulator._generate_minimal_topology()
    request = SimulationRequest(
        action=SimulationAction.REMOVE_LINK,
        src="R1",
        dst="R2"
    )
    
    modified_graph = simulator._apply_simulation_changes(graph, request)
    
    assert not modified_graph.has_edge("R1", "R2")


def test_calculate_packet_loss(simulator):
    """Test packet loss calculation."""
    graph = nx.Graph()
    graph.add_edge("A", "B", utilization=0.9)  # High utilization
    graph.add_edge("B", "C", utilization=0.5)  # Normal utilization
    
    packet_loss = simulator._calculate_packet_loss(graph)
    
    assert packet_loss > 0
    assert packet_loss <= 0.1


def test_assess_risk_level(simulator):
    """Test risk level assessment."""
    # Low risk scenario
    risk = simulator._assess_risk_level(True, True, 0.001, [])
    assert risk == "low"
    
    # High risk scenario
    risk = simulator._assess_risk_level(True, True, 0.08, ["R1-R2", "R2-R3", "R3-R4"])
    assert risk == "high"
    
    # Critical risk scenario - network partition
    risk = simulator._assess_risk_level(True, False, 0.0, [])
    assert risk == "critical"


def test_generate_recommendations(simulator):
    """Test recommendation generation."""
    request = SimulationRequest(
        action=SimulationAction.ADD_LINK,
        src="R1",
        dst="R3"
    )
    
    recommendations = simulator._generate_recommendations(
        request, "low", []
    )
    
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0
    assert any("redundancy" in rec.lower() for rec in recommendations)


@pytest.mark.asyncio
async def test_get_simulation_result_not_found(simulator, mock_redis):
    """Test getting non-existent simulation result."""
    mock_redis.get.return_value = None
    
    result = await simulator.get_simulation_result("nonexistent-id")
    
    assert result is None


@pytest.mark.asyncio 
async def test_cache_simulation(simulator, mock_redis):
    """Test caching simulation result."""
    request = SimulationRequest(
        action=SimulationAction.ADD_LINK,
        src="R1",
        dst="R3"
    )
    
    result = await simulator.simulate(request)
    
    # Verify Redis setex was called
    mock_redis.setex.assert_called()
    args = mock_redis.setex.call_args[0]
    assert args[0].startswith("simulation:")
    assert args[1] == 3600  # TTL
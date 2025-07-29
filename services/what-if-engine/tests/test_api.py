import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    with patch("app.main.get_database_connections") as mock_db:
        # Mock database connections
        mock_neo4j = MagicMock()
        mock_neo4j.verify_connectivity.return_value = True
        
        mock_redis = MagicMock()
        mock_redis.ping.return_value = True
        
        mock_db.return_value = {
            "neo4j": mock_neo4j,
            "redis": mock_redis
        }
        
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "OK"
        assert data["service"] == "what-if-engine"


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "NetTwinSaaS What-If Engine"
    assert "version" in data


def test_login_success():
    """Test successful login."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "demo", "password": "demo"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failure():
    """Test failed login."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "wrong", "password": "wrong"}
    )
    assert response.status_code == 401


def test_simulate_without_auth():
    """Test simulation without authentication."""
    response = client.post(
        "/api/v1/simulate",
        json={
            "action": "add_link",
            "src": "R1",
            "dst": "R3",
            "capacity": 1000
        }
    )
    assert response.status_code == 403  # No Authorization header


def test_simulate_with_demo_token():
    """Test simulation with demo token."""
    with patch("app.services.simulation_engine.NetworkSimulator.simulate") as mock_simulate:
        from app.models.simulation import SimulationResult, SimulationStatus, SimulationRequest, SimulationAction
        
        # Mock simulation result
        mock_result = SimulationResult(
            simulation_id="test-123",
            status=SimulationStatus.COMPLETED,
            request=SimulationRequest(
                action=SimulationAction.ADD_LINK,
                src="R1",
                dst="R3",
                capacity=1000
            )
        )
        mock_simulate.return_value = mock_result
        
        response = client.post(
            "/api/v1/simulate",
            json={
                "action": "add_link", 
                "src": "R1",
                "dst": "R3",
                "capacity": 1000
            },
            headers={"Authorization": "Bearer demo-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["simulation_id"] == "test-123"
        assert data["status"] == "completed"


def test_get_system_metrics():
    """Test getting system metrics."""
    response = client.get(
        "/api/v1/metrics/system",
        headers={"Authorization": "Bearer demo-token"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "cpu_usage" in data
    assert "memory_usage" in data
    assert "active_simulations" in data


def test_get_network_metrics():
    """Test getting network metrics."""
    response = client.get(
        "/api/v1/metrics/network",
        headers={"Authorization": "Bearer demo-token"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_nodes" in data
    assert "total_links" in data
    assert "average_utilization" in data
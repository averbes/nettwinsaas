import pytest
from unittest.mock import MagicMock

from app.services.config_engine import ConfigurationEngine
from app.models.config import ConfigGenerationRequest, ConfigType, JobStatus


@pytest.fixture
def mock_connections():
    """Mock database connections."""
    mock_redis = MagicMock()
    mock_redis.get.return_value = None
    mock_redis.setex.return_value = True
    mock_redis.ping.return_value = True
    
    mock_vault = MagicMock()
    
    return {
        "redis": mock_redis,
        "vault": mock_vault
    }


@pytest.fixture
def config_engine(mock_connections, monkeypatch):
    """Create ConfigurationEngine with mocked dependencies."""
    monkeypatch.setattr(
        "app.services.config_engine.get_database_connections",
        lambda: mock_connections
    )
    return ConfigurationEngine()


@pytest.mark.asyncio
async def test_generate_configurations(config_engine):
    """Test configuration generation."""
    request = ConfigGenerationRequest(
        simulation_id="sim-001",
        targets=["R1", "R3"],
        config_type=ConfigType.QOS,
        dry_run=True
    )
    
    job = await config_engine.generate_configurations(request)
    
    assert job.job_id is not None
    assert job.status in [JobStatus.RUNNING, JobStatus.PENDING]
    assert job.request.simulation_id == "sim-001"
    assert job.request.targets == ["R1", "R3"]


@pytest.mark.asyncio
async def test_generate_device_configs_qos(config_engine):
    """Test QoS configuration generation."""
    request = ConfigGenerationRequest(
        simulation_id="sim-001", 
        targets=["R1"],
        config_type=ConfigType.QOS
    )
    
    configs = await config_engine._generate_device_configs(request)
    
    assert "R1" in configs
    assert "policy-map" in configs["R1"].lower() or "class-of-service" in configs["R1"].lower()


@pytest.mark.asyncio
async def test_get_device_info(config_engine):
    """Test device information retrieval."""
    device_info = await config_engine._get_device_info("R1")
    
    assert "vendor" in device_info
    assert "model" in device_info
    assert "os" in device_info


def test_generate_cisco_qos_config(config_engine):
    """Test Cisco QoS configuration generation."""
    config = config_engine._generate_cisco_qos_config({})
    
    assert "policy-map" in config.lower()
    assert "voice" in config.lower()
    assert "class-default" in config.lower()


def test_generate_juniper_qos_config(config_engine):
    """Test Juniper QoS configuration generation."""
    config = config_engine._generate_juniper_qos_config({})
    
    assert "class-of-service" in config.lower()
    assert "voice" in config.lower()
    assert "scheduler" in config.lower()


@pytest.mark.asyncio
async def test_get_config_job_not_found(config_engine, mock_connections):
    """Test getting non-existent config job."""
    mock_connections["redis"].get.return_value = None
    
    job = await config_engine.get_config_job("nonexistent-id")
    
    assert job is None
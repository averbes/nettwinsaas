from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import structlog

from app.services.collector_engine import MetricsCollector
from app.core.dependencies import get_database_connections

router = APIRouter()
logger = structlog.get_logger()


@router.get("/devices/{device_id}/latest")
async def get_latest_device_metrics(device_id: str):
    """Get latest metrics for a specific device."""
    try:
        # For demo, create a collector instance
        collector = MetricsCollector()
        metrics = await collector.get_latest_metrics(device_id)
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get device metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get device metrics")


@router.get("/devices")
async def get_all_device_metrics():
    """Get latest metrics for all devices."""
    try:
        devices = ["R1", "R2", "R3", "R4", "R5"]
        all_metrics = {}
        
        collector = MetricsCollector()
        
        for device_id in devices:
            metrics = await collector.get_latest_metrics(device_id)
            all_metrics[device_id] = metrics
        
        return all_metrics
        
    except Exception as e:
        logger.error("Failed to get all device metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get all device metrics")


@router.get("/interfaces/{device_id}")
async def get_device_interface_metrics(device_id: str):
    """Get interface metrics for a specific device."""
    try:
        collector = MetricsCollector()
        metrics = await collector.get_latest_metrics(device_id)
        
        return {
            "device_id": device_id,
            "interfaces": metrics.get("interface_metrics", [])
        }
        
    except Exception as e:
        logger.error("Failed to get interface metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get interface metrics")


@router.get("/historical")
async def get_historical_metrics(
    device_id: Optional[str] = Query(None),
    metric_type: Optional[str] = Query("device", regex="^(device|interface)$"),
    hours: int = Query(24, ge=1, le=168)  # 1 hour to 1 week
):
    """Get historical metrics from ClickHouse."""
    try:
        # Mock historical data for demo
        import random
        from datetime import datetime, timedelta
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Generate sample historical data
        historical_data = []
        current_time = start_time
        
        while current_time <= end_time:
            if metric_type == "device":
                data_point = {
                    "timestamp": current_time.isoformat(),
                    "device_id": device_id or "R1",
                    "cpu_usage": random.uniform(20.0, 80.0),
                    "memory_usage": random.uniform(30.0, 70.0),
                    "temperature": random.uniform(40.0, 60.0)
                }
            else:  # interface
                data_point = {
                    "timestamp": current_time.isoformat(),
                    "device_id": device_id or "R1",
                    "interface": "GigabitEthernet0/0",
                    "utilization": random.uniform(0.1, 0.9),
                    "in_octets": random.randint(1000000, 10000000),
                    "out_octets": random.randint(800000, 8000000)
                }
            
            historical_data.append(data_point)
            current_time += timedelta(minutes=5)  # 5-minute intervals
        
        return {
            "device_id": device_id,
            "metric_type": metric_type,
            "time_range": f"{hours}h",
            "data": historical_data[-100:]  # Limit to last 100 points
        }
        
    except Exception as e:
        logger.error("Failed to get historical metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get historical metrics")


@router.get("/summary")
async def get_metrics_summary():
    """Get summary of all metrics."""
    try:
        # Mock summary data
        return {
            "total_devices": 5,
            "online_devices": 5,
            "total_interfaces": 15,
            "active_interfaces": 14,
            "average_cpu": 45.2,
            "average_memory": 55.8,
            "average_utilization": 0.42,
            "last_collection": "2024-01-15T10:30:00Z"
        }
        
    except Exception as e:
        logger.error("Failed to get metrics summary", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get metrics summary")
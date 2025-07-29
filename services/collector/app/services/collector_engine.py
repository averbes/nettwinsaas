import asyncio
import time
import random
from typing import Dict, Any, List
from datetime import datetime, timedelta
import structlog

from app.core.dependencies import get_database_connections
from app.core.config import settings

logger = structlog.get_logger()


class MetricsCollector:
    """Network metrics collection engine."""
    
    def __init__(self):
        self.db_connections = get_database_connections()
        self.running = False
        self.collection_task = None
    
    async def start(self):
        """Start the metrics collection process."""
        if self.running:
            return
        
        self.running = True
        logger.info("Starting metrics collection", interval=settings.COLLECTION_INTERVAL)
        
        # Initialize ClickHouse tables
        await self._init_clickhouse_tables()
        
        # Start collection task
        self.collection_task = asyncio.create_task(self._collection_loop())
    
    async def stop(self):
        """Stop the metrics collection process."""
        if not self.running:
            return
        
        self.running = False
        logger.info("Stopping metrics collection")
        
        if self.collection_task:
            self.collection_task.cancel()
            try:
                await self.collection_task
            except asyncio.CancelledError:
                pass
    
    async def _collection_loop(self):
        """Main collection loop."""
        while self.running:
            try:
                # Collect metrics from all sources
                await self._collect_all_metrics()
                
                # Wait for next collection interval
                await asyncio.sleep(settings.COLLECTION_INTERVAL)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Error in collection loop", error=str(e))
                await asyncio.sleep(5)  # Wait before retrying
    
    async def _collect_all_metrics(self):
        """Collect metrics from all sources."""
        start_time = time.time()
        
        try:
            # Collect interface metrics
            interface_metrics = await self._collect_interface_metrics()
            
            # Collect device metrics
            device_metrics = await self._collect_device_metrics()
            
            # Store metrics in ClickHouse
            await self._store_interface_metrics(interface_metrics)
            await self._store_device_metrics(device_metrics)
            
            # Cache latest metrics in Redis
            await self._cache_latest_metrics(interface_metrics, device_metrics)
            
            collection_time = time.time() - start_time
            logger.info(
                "Metrics collection completed",
                interface_metrics=len(interface_metrics),
                device_metrics=len(device_metrics),
                collection_time=round(collection_time, 2)
            )
            
        except Exception as e:
            logger.error("Failed to collect metrics", error=str(e))
    
    async def _collect_interface_metrics(self) -> List[Dict[str, Any]]:
        """Collect interface metrics (synthetic data for demo)."""
        metrics = []
        
        # Generate synthetic metrics for demo routers
        devices = ["R1", "R2", "R3", "R4", "R5"]
        interfaces = ["GigabitEthernet0/0", "GigabitEthernet0/1", "Serial0/0/0"]
        
        timestamp = datetime.utcnow()
        
        for device in devices:
            for interface in interfaces:
                # Generate realistic network metrics
                in_octets = random.randint(1000000, 50000000)  # bytes
                out_octets = random.randint(800000, 40000000)  # bytes
                in_packets = random.randint(1000, 100000)
                out_packets = random.randint(800, 80000)
                in_errors = random.randint(0, 100)
                out_errors = random.randint(0, 50)
                
                utilization = random.uniform(0.1, 0.9)  # 10-90% utilization
                
                metric = {
                    "timestamp": timestamp,
                    "device_id": device,
                    "interface": interface,
                    "in_octets": in_octets,
                    "out_octets": out_octets,
                    "in_packets": in_packets,
                    "out_packets": out_packets,
                    "in_errors": in_errors,
                    "out_errors": out_errors,
                    "utilization": round(utilization, 3),
                    "status": "up" if random.random() > 0.05 else "down"
                }
                
                metrics.append(metric)
        
        return metrics
    
    async def _collect_device_metrics(self) -> List[Dict[str, Any]]:
        """Collect device metrics (synthetic data for demo)."""
        metrics = []
        
        devices = ["R1", "R2", "R3", "R4", "R5"]
        timestamp = datetime.utcnow()
        
        for device in devices:
            # Generate realistic device metrics
            cpu_usage = random.uniform(10.0, 80.0)  # 10-80% CPU
            memory_usage = random.uniform(20.0, 70.0)  # 20-70% memory
            temperature = random.uniform(35.0, 65.0)  # 35-65°C
            uptime = random.randint(86400, 31536000)  # 1 day to 1 year in seconds
            
            metric = {
                "timestamp": timestamp,
                "device_id": device,
                "cpu_usage": round(cpu_usage, 2),
                "memory_usage": round(memory_usage, 2),
                "temperature": round(temperature, 1),
                "uptime": uptime,
                "status": "online" if random.random() > 0.02 else "offline"
            }
            
            metrics.append(metric)
        
        return metrics
    
    async def _init_clickhouse_tables(self):
        """Initialize ClickHouse tables."""
        try:
            clickhouse_client = self.db_connections["clickhouse"]
            
            # Create interface metrics table
            interface_table_sql = """
            CREATE TABLE IF NOT EXISTS interface_metrics (
                timestamp DateTime,
                device_id String,
                interface String,
                in_octets UInt64,
                out_octets UInt64,
                in_packets UInt64,
                out_packets UInt64,
                in_errors UInt32,
                out_errors UInt32,
                utilization Float32,
                status String
            ) ENGINE = MergeTree()
            ORDER BY (device_id, interface, timestamp)
            """
            
            # Create device metrics table
            device_table_sql = """
            CREATE TABLE IF NOT EXISTS device_metrics (
                timestamp DateTime,
                device_id String,
                cpu_usage Float32,
                memory_usage Float32,
                temperature Float32,
                uptime UInt32,
                status String
            ) ENGINE = MergeTree()
            ORDER BY (device_id, timestamp)
            """
            
            clickhouse_client.execute(interface_table_sql)
            clickhouse_client.execute(device_table_sql)
            
            logger.info("ClickHouse tables initialized")
            
        except Exception as e:
            logger.error("Failed to initialize ClickHouse tables", error=str(e))
            raise
    
    async def _store_interface_metrics(self, metrics: List[Dict[str, Any]]):
        """Store interface metrics in ClickHouse."""
        if not metrics:
            return
        
        try:
            clickhouse_client = self.db_connections["clickhouse"]
            
            # Prepare data for bulk insert
            data = [
                [
                    metric["timestamp"],
                    metric["device_id"],
                    metric["interface"],
                    metric["in_octets"],
                    metric["out_octets"],
                    metric["in_packets"],
                    metric["out_packets"],
                    metric["in_errors"],
                    metric["out_errors"],
                    metric["utilization"],
                    metric["status"]
                ]
                for metric in metrics
            ]
            
            clickhouse_client.insert(
                "interface_metrics",
                data,
                column_names=[
                    "timestamp", "device_id", "interface",
                    "in_octets", "out_octets", "in_packets", "out_packets",
                    "in_errors", "out_errors", "utilization", "status"
                ]
            )
            
        except Exception as e:
            logger.error("Failed to store interface metrics", error=str(e))
    
    async def _store_device_metrics(self, metrics: List[Dict[str, Any]]):
        """Store device metrics in ClickHouse."""
        if not metrics:
            return
        
        try:
            clickhouse_client = self.db_connections["clickhouse"]
            
            # Prepare data for bulk insert
            data = [
                [
                    metric["timestamp"],
                    metric["device_id"],
                    metric["cpu_usage"],
                    metric["memory_usage"],
                    metric["temperature"],
                    metric["uptime"],
                    metric["status"]
                ]
                for metric in metrics
            ]
            
            clickhouse_client.insert(
                "device_metrics",
                data,
                column_names=[
                    "timestamp", "device_id", "cpu_usage",
                    "memory_usage", "temperature", "uptime", "status"
                ]
            )
            
        except Exception as e:
            logger.error("Failed to store device metrics", error=str(e))
    
    async def _cache_latest_metrics(
        self, 
        interface_metrics: List[Dict[str, Any]], 
        device_metrics: List[Dict[str, Any]]
    ):
        """Cache latest metrics in Redis for fast access."""
        try:
            redis_client = self.db_connections["redis"]
            
            # Cache latest interface metrics per device
            for metric in interface_metrics:
                key = f"interface:{metric['device_id']}:{metric['interface']}"
                import json
                redis_client.setex(
                    key,
                    300,  # 5 minutes TTL
                    json.dumps(metric, default=str)
                )
            
            # Cache latest device metrics
            for metric in device_metrics:
                key = f"device:{metric['device_id']}"
                import json
                redis_client.setex(
                    key,
                    300,  # 5 minutes TTL
                    json.dumps(metric, default=str)
                )
            
        except Exception as e:
            logger.error("Failed to cache latest metrics", error=str(e))
    
    async def get_latest_metrics(self, device_id: str) -> Dict[str, Any]:
        """Get latest metrics for a device."""
        try:
            redis_client = self.db_connections["redis"]
            
            # Get device metrics
            device_key = f"device:{device_id}"
            device_data = redis_client.get(device_key)
            
            device_metrics = {}
            if device_data:
                import json
                device_metrics = json.loads(device_data)
            
            # Get interface metrics
            interface_keys = redis_client.keys(f"interface:{device_id}:*")
            interface_metrics = []
            
            for key in interface_keys:
                data = redis_client.get(key)
                if data:
                    import json
                    interface_metrics.append(json.loads(data))
            
            return {
                "device_metrics": device_metrics,
                "interface_metrics": interface_metrics
            }
            
        except Exception as e:
            logger.error("Failed to get latest metrics", error=str(e))
            return {"device_metrics": {}, "interface_metrics": []}
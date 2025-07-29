import asyncio
import ipaddress
from typing import List, Dict, Any, Optional
import uuid
import structlog
from datetime import datetime

from app.models.topology import (
    DiscoveryRequest, DiscoveryResult, DiscoveryStatus,
    Node, Link, NodeType, NetworkTopology
)
from app.core.dependencies import get_database_connections

logger = structlog.get_logger()


class NetworkDiscoverer:
    """Network topology discovery engine."""
    
    def __init__(self):
        self.db_connections = get_database_connections()
    
    async def discover_network(self, request: DiscoveryRequest) -> DiscoveryResult:
        """Start network discovery process."""
        discovery_id = str(uuid.uuid4())
        
        logger.info(
            "Starting network discovery",
            discovery_id=discovery_id,
            network_range=request.network_range,
            discovery_type=request.discovery_type.value
        )
        
        result = DiscoveryResult(
            discovery_id=discovery_id,
            status=DiscoveryStatus.RUNNING,
            request=request
        )
        
        try:
            # Cache initial result
            await self._cache_discovery_result(result)
            
            # Start discovery process in background
            asyncio.create_task(self._run_discovery(result))
            
            # Return immediately with RUNNING status
            result.status = DiscoveryStatus.RUNNING
            return result
            
        except Exception as e:
            logger.error("Failed to start discovery", error=str(e))
            result.status = DiscoveryStatus.FAILED
            result.errors.append(str(e))
            await self._cache_discovery_result(result)
            return result
    
    async def _run_discovery(self, result: DiscoveryResult):
        """Run the actual discovery process."""
        try:
            # For demo, create synthetic topology
            nodes, links = self._generate_synthetic_topology(result.request)
            
            # Save to Neo4j
            await self._save_topology_to_neo4j(nodes, links)
            
            # Update result
            result.status = DiscoveryStatus.COMPLETED
            result.nodes_discovered = len(nodes)
            result.links_discovered = len(links)
            result.completed_at = datetime.utcnow()
            
            logger.info(
                "Discovery completed",
                discovery_id=result.discovery_id,
                nodes_discovered=result.nodes_discovered,
                links_discovered=result.links_discovered
            )
            
        except Exception as e:
            logger.error("Discovery failed", error=str(e))
            result.status = DiscoveryStatus.FAILED
            result.errors.append(str(e))
            result.completed_at = datetime.utcnow()
        
        finally:
            await self._cache_discovery_result(result)
    
    def _generate_synthetic_topology(
        self, 
        request: DiscoveryRequest
    ) -> tuple[List[Node], List[Link]]:
        """Generate synthetic network topology for demo."""
        
        nodes = []
        links = []
        
        # Create router nodes
        router_configs = [
            {"name": "R1", "ip": "192.168.1.1", "vendor": "Cisco", "model": "ISR4331"},
            {"name": "R2", "ip": "192.168.1.2", "vendor": "Cisco", "model": "ISR4331"}, 
            {"name": "R3", "ip": "192.168.1.3", "vendor": "Juniper", "model": "SRX300"},
            {"name": "R4", "ip": "192.168.1.4", "vendor": "Cisco", "model": "ASR1001"},
            {"name": "R5", "ip": "192.168.1.5", "vendor": "Juniper", "model": "SRX300"},
        ]
        
        for config in router_configs:
            node = Node(
                id=config["name"],
                name=config["name"],
                type=NodeType.ROUTER,
                ip_address=config["ip"],
                vendor=config["vendor"],
                model=config["model"],
                version="15.6(3)M",
                interfaces={
                    "GigabitEthernet0/0": {"status": "up", "ip": config["ip"]},
                    "GigabitEthernet0/1": {"status": "up"},
                    "Serial0/0/0": {"status": "up"}
                }
            )
            nodes.append(node)
        
        # Create links between routers
        link_configs = [
            {"src": "R1", "dst": "R2", "capacity": 1000, "cost": 10},
            {"src": "R1", "dst": "R3", "capacity": 1000, "cost": 15},
            {"src": "R2", "dst": "R3", "capacity": 500, "cost": 20},
            {"src": "R2", "dst": "R4", "capacity": 1000, "cost": 10},
            {"src": "R3", "dst": "R4", "capacity": 1000, "cost": 12},
            {"src": "R3", "dst": "R5", "capacity": 500, "cost": 25},
            {"src": "R4", "dst": "R5", "capacity": 1000, "cost": 8},
        ]
        
        for i, config in enumerate(link_configs):
            link = Link(
                id=f"link_{i+1}",
                source=config["src"],
                target=config["dst"],
                interface_src=f"GigabitEthernet0/{i%2}",
                interface_dst=f"GigabitEthernet0/{(i+1)%2}",
                capacity=config["capacity"],
                utilization=round(__import__('random').uniform(0.2, 0.8), 2),
                latency=round(__import__('random').uniform(1.0, 10.0), 1),
                cost=config["cost"]
            )
            links.append(link)
        
        return nodes, links
    
    async def _save_topology_to_neo4j(self, nodes: List[Node], links: List[Link]):
        """Save topology to Neo4j database."""
        try:
            neo4j_driver = self.db_connections["neo4j"]
            
            with neo4j_driver.session() as session:
                # Clear existing topology
                session.run("MATCH (n) DETACH DELETE n")
                
                # Create nodes
                for node in nodes:
                    session.run(
                        """
                        CREATE (n:NetworkNode {
                            id: $id,
                            name: $name,
                            type: $type,
                            ip_address: $ip_address,
                            vendor: $vendor,
                            model: $model,
                            version: $version,
                            discovered_at: datetime($discovered_at)
                        })
                        """,
                        id=node.id,
                        name=node.name,
                        type=node.type.value,
                        ip_address=node.ip_address,
                        vendor=node.vendor,
                        model=node.model,
                        version=node.version,
                        discovered_at=node.discovered_at.isoformat()
                    )
                
                # Create relationships (links)
                for link in links:
                    session.run(
                        """
                        MATCH (a:NetworkNode {id: $source})
                        MATCH (b:NetworkNode {id: $target})
                        CREATE (a)-[r:CONNECTED_TO {
                            id: $id,
                            capacity: $capacity,
                            utilization: $utilization,
                            latency: $latency,
                            cost: $cost,
                            interface_src: $interface_src,
                            interface_dst: $interface_dst,
                            discovered_at: datetime($discovered_at)
                        }]->(b)
                        """,
                        source=link.source,
                        target=link.target,
                        id=link.id,
                        capacity=link.capacity,
                        utilization=link.utilization,
                        latency=link.latency,
                        cost=link.cost,
                        interface_src=link.interface_src,
                        interface_dst=link.interface_dst,
                        discovered_at=link.discovered_at.isoformat()
                    )
                
                logger.info("Topology saved to Neo4j successfully")
                
        except Exception as e:
            logger.error("Failed to save topology to Neo4j", error=str(e))
            raise
    
    async def get_discovery_status(self, discovery_id: str) -> Optional[DiscoveryResult]:
        """Get discovery status."""
        try:
            redis_client = self.db_connections["redis"]
            cached_data = redis_client.get(f"discovery:{discovery_id}")
            
            if cached_data:
                import json
                data = json.loads(cached_data)
                return DiscoveryResult.model_validate(data)
            
            return None
            
        except Exception as e:
            logger.error("Failed to get discovery status", error=str(e))
            return None
    
    async def get_network_topology(self) -> NetworkTopology:
        """Get current network topology."""
        try:
            neo4j_driver = self.db_connections["neo4j"]
            nodes = []
            links = []
            
            with neo4j_driver.session() as session:
                # Get nodes
                result = session.run(
                    """
                    MATCH (n:NetworkNode)
                    RETURN n.id as id, n.name as name, n.type as type,
                           n.ip_address as ip_address, n.vendor as vendor,
                           n.model as model, n.version as version,
                           n.discovered_at as discovered_at
                    """
                )
                
                for record in result:
                    node = Node(
                        id=record["id"],
                        name=record["name"],
                        type=NodeType(record["type"]),
                        ip_address=record["ip_address"],
                        vendor=record["vendor"],
                        model=record["model"],
                        version=record["version"],
                        discovered_at=datetime.fromisoformat(
                            record["discovered_at"].replace("Z", "+00:00")
                        ) if record["discovered_at"] else datetime.utcnow()
                    )
                    nodes.append(node)
                
                # Get links
                result = session.run(
                    """
                    MATCH (a:NetworkNode)-[r:CONNECTED_TO]->(b:NetworkNode)
                    RETURN r.id as id, a.id as source, b.id as target,
                           r.capacity as capacity, r.utilization as utilization,
                           r.latency as latency, r.cost as cost,
                           r.interface_src as interface_src,
                           r.interface_dst as interface_dst,
                           r.discovered_at as discovered_at
                    """
                )
                
                for record in result:
                    link = Link(
                        id=record["id"],
                        source=record["source"],
                        target=record["target"],
                        capacity=record["capacity"],
                        utilization=record["utilization"],
                        latency=record["latency"],
                        cost=record["cost"],
                        interface_src=record["interface_src"],
                        interface_dst=record["interface_dst"],
                        discovered_at=datetime.fromisoformat(
                            record["discovered_at"].replace("Z", "+00:00")
                        ) if record["discovered_at"] else datetime.utcnow()
                    )
                    links.append(link)
            
            return NetworkTopology(
                nodes=nodes,
                links=links,
                metadata={
                    "total_nodes": len(nodes),
                    "total_links": len(links),
                    "last_discovery": datetime.utcnow().isoformat()
                }
            )
            
        except Exception as e:
            logger.error("Failed to get network topology", error=str(e))
            # Return empty topology as fallback
            return NetworkTopology()
    
    async def _cache_discovery_result(self, result: DiscoveryResult):
        """Cache discovery result in Redis."""
        try:
            redis_client = self.db_connections["redis"]
            import json
            data = result.model_dump(mode='json')
            redis_client.setex(
                f"discovery:{result.discovery_id}",
                3600,  # 1 hour TTL
                json.dumps(data)
            )
        except Exception as e:
            logger.error("Failed to cache discovery result", error=str(e))
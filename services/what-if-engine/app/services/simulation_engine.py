import asyncio
import time
import uuid
import networkx as nx
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
import structlog

from app.models.simulation import (
    SimulationRequest, SimulationResult, SimulationStatus,
    ImpactAnalysis, NetworkMetrics, SimulationAction
)
from app.core.dependencies import get_neo4j_driver, get_redis_client
from app.core.logging import log_simulation_event

logger = structlog.get_logger()


class NetworkSimulator:
    """Network simulation engine."""
    
    def __init__(self):
        self.neo4j_driver = get_neo4j_driver()
        self.redis_client = get_redis_client()
        self._graph_cache = {}
    
    async def simulate(self, request: SimulationRequest) -> SimulationResult:
        """Execute network simulation."""
        simulation_id = str(uuid.uuid4())
        start_time = time.time()
        
        log_simulation_event(
            "simulation_started",
            simulation_id=simulation_id,
            action=request.action.value
        )
        
        try:
            # Create simulation result
            result = SimulationResult(
                simulation_id=simulation_id,
                status=SimulationStatus.RUNNING,
                request=request
            )
            
            # Cache simulation in Redis
            await self._cache_simulation(result)
            
            # Load current network topology
            network_graph = await self._load_network_topology()
            
            # Apply simulation changes
            modified_graph = self._apply_simulation_changes(
                network_graph, request
            )
            
            # Analyze impact
            impact_analysis = await self._analyze_impact(
                network_graph, modified_graph, request
            )
            
            # Update result
            result.status = SimulationStatus.COMPLETED
            result.impact_analysis = impact_analysis
            result.execution_time = time.time() - start_time
            
            # Cache updated result
            await self._cache_simulation(result)
            
            log_simulation_event(
                "simulation_completed",
                simulation_id=simulation_id,
                execution_time=result.execution_time,
                risk_level=impact_analysis.risk_level
            )
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            logger.error(
                "Simulation failed",
                simulation_id=simulation_id,
                error=error_msg
            )
            
            result = SimulationResult(
                simulation_id=simulation_id,
                status=SimulationStatus.FAILED,
                request=request,
                error_message=error_msg,
                execution_time=time.time() - start_time
            )
            
            await self._cache_simulation(result)
            return result
    
    async def get_simulation_result(self, simulation_id: str) -> Optional[SimulationResult]:
        """Get simulation result from cache."""
        try:
            redis_client = await self.redis_client
            cached_data = await redis_client.get(f"simulation:{simulation_id}")
            if cached_data:
                import json
                data = json.loads(cached_data)
                return SimulationResult.model_validate(data)
            return None
        except Exception as e:
            logger.error("Failed to retrieve simulation result", error=str(e))
            return None
    
    async def _load_network_topology(self) -> nx.Graph:
        """Load network topology from Neo4j."""
        try:
            graph = nx.Graph()
            
            # Use synthetic data for demo
            synthetic_topology = self._generate_synthetic_topology()
            return synthetic_topology
            
        except Exception as e:
            logger.error("Failed to load network topology", error=str(e))
            # Return minimal synthetic topology as fallback
            return self._generate_minimal_topology()
    
    def _generate_synthetic_topology(self) -> nx.Graph:
        """Generate synthetic network topology for demo."""
        graph = nx.Graph()
        
        # Add nodes (routers)
        routers = ["R1", "R2", "R3", "R4", "R5"]
        for router in routers:
            graph.add_node(router, type="router", vendor="Cisco")
        
        # Add links with capacity and utilization
        links = [
            ("R1", "R2", {"capacity": 1000, "utilization": 0.65, "latency": 2}),
            ("R1", "R3", {"capacity": 1000, "utilization": 0.45, "latency": 5}),
            ("R2", "R3", {"capacity": 500, "utilization": 0.80, "latency": 3}),
            ("R2", "R4", {"capacity": 1000, "utilization": 0.30, "latency": 4}),
            ("R3", "R4", {"capacity": 1000, "utilization": 0.55, "latency": 3}),
            ("R3", "R5", {"capacity": 500, "utilization": 0.70, "latency": 6}),
            ("R4", "R5", {"capacity": 1000, "utilization": 0.40, "latency": 2}),
        ]
        
        for src, dst, attrs in links:
            graph.add_edge(src, dst, **attrs)
        
        return graph
    
    def _generate_minimal_topology(self) -> nx.Graph:
        """Generate minimal topology as fallback."""
        graph = nx.Graph()
        graph.add_edge("R1", "R2", capacity=1000, utilization=0.5, latency=2)
        graph.add_edge("R2", "R3", capacity=1000, utilization=0.5, latency=2)
        return graph
    
    def _apply_simulation_changes(
        self, 
        graph: nx.Graph, 
        request: SimulationRequest
    ) -> nx.Graph:
        """Apply simulation changes to network graph."""
        modified_graph = graph.copy()
        
        if request.action == SimulationAction.ADD_LINK:
            if request.src and request.dst:
                modified_graph.add_edge(
                    request.src,
                    request.dst,
                    capacity=request.capacity or 1000,
                    utilization=0.0,
                    latency=request.latency or 3
                )
        
        elif request.action == SimulationAction.REMOVE_LINK:
            if request.src and request.dst:
                if modified_graph.has_edge(request.src, request.dst):
                    modified_graph.remove_edge(request.src, request.dst)
        
        elif request.action == SimulationAction.CHANGE_CAPACITY:
            if request.src and request.dst:
                if modified_graph.has_edge(request.src, request.dst):
                    modified_graph[request.src][request.dst]["capacity"] = (
                        request.capacity or 1000
                    )
        
        return modified_graph
    
    async def _analyze_impact(
        self,
        original_graph: nx.Graph,
        modified_graph: nx.Graph,
        request: SimulationRequest
    ) -> ImpactAnalysis:
        """Analyze impact of network changes."""
        
        # Calculate connectivity changes
        original_connected = nx.is_connected(original_graph)
        modified_connected = nx.is_connected(modified_graph)
        
        # Find congested links (utilization > 0.8)
        congested_links = []
        for src, dst, attrs in modified_graph.edges(data=True):
            if attrs.get("utilization", 0) > 0.8:
                congested_links.append(f"{src}-{dst}")
        
        # Calculate packet loss estimate
        packet_loss = self._calculate_packet_loss(modified_graph)
        
        # Calculate latency impact
        latency_increase = self._calculate_latency_impact(
            original_graph, modified_graph
        )
        
        # Determine risk level
        risk_level = self._assess_risk_level(
            original_connected, modified_connected, 
            packet_loss, congested_links
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            request, risk_level, congested_links
        )
        
        return ImpactAnalysis(
            affected_paths=self._find_affected_paths(original_graph, modified_graph),
            congested_links=congested_links,
            packet_loss=packet_loss,
            latency_increase=latency_increase,
            redundancy_impact="improved" if len(modified_graph.edges) > len(original_graph.edges) else "reduced",
            risk_level=risk_level,
            recommendations=recommendations
        )
    
    def _calculate_packet_loss(self, graph: nx.Graph) -> float:
        """Calculate estimated packet loss."""
        total_loss = 0.0
        total_links = 0
        
        for _, _, attrs in graph.edges(data=True):
            utilization = attrs.get("utilization", 0.0)
            if utilization > 0.8:
                # Exponential increase in loss as utilization approaches 1.0
                loss = min(0.1, (utilization - 0.8) * 0.5)
                total_loss += loss
            total_links += 1
        
        return total_loss / max(total_links, 1)
    
    def _calculate_latency_impact(
        self, 
        original_graph: nx.Graph, 
        modified_graph: nx.Graph
    ) -> float:
        """Calculate latency impact."""
        try:
            # Calculate shortest path latencies
            original_paths = dict(nx.all_pairs_shortest_path_length(
                original_graph, weight="latency"
            ))
            modified_paths = dict(nx.all_pairs_shortest_path_length(
                modified_graph, weight="latency"
            ))
            
            total_latency_change = 0.0
            path_count = 0
            
            for src in original_paths:
                for dst in original_paths[src]:
                    if src != dst and dst in modified_paths.get(src, {}):
                        original_latency = original_paths[src][dst]
                        modified_latency = modified_paths[src][dst]
                        total_latency_change += modified_latency - original_latency
                        path_count += 1
            
            return total_latency_change / max(path_count, 1)
        
        except Exception:
            return 0.0
    
    def _find_affected_paths(
        self, 
        original_graph: nx.Graph, 
        modified_graph: nx.Graph
    ) -> List[str]:
        """Find paths affected by the change."""
        affected_paths = []
        
        # Find all node pairs
        nodes = list(original_graph.nodes())
        for i, src in enumerate(nodes):
            for dst in nodes[i+1:]:
                try:
                    original_path = nx.shortest_path(original_graph, src, dst)
                    modified_path = nx.shortest_path(modified_graph, src, dst)
                    
                    if original_path != modified_path:
                        path_str = " -> ".join(modified_path)
                        affected_paths.append(path_str)
                except nx.NetworkXNoPath:
                    continue
        
        return affected_paths[:10]  # Limit to first 10 paths
    
    def _assess_risk_level(
        self,
        original_connected: bool,
        modified_connected: bool,
        packet_loss: float,
        congested_links: List[str]
    ) -> str:
        """Assess risk level of the change."""
        if not modified_connected and original_connected:
            return "critical"
        
        if packet_loss > 0.05 or len(congested_links) > 3:
            return "high"
        
        if packet_loss > 0.01 or len(congested_links) > 1:
            return "medium"
        
        return "low"
    
    def _generate_recommendations(
        self,
        request: SimulationRequest,
        risk_level: str,
        congested_links: List[str]
    ) -> List[str]:
        """Generate recommendations based on simulation results."""
        recommendations = []
        
        if risk_level == "critical":
            recommendations.append("Change causes network partitioning - not recommended")
        
        if risk_level == "high":
            recommendations.append("Consider implementing QoS policies")
            recommendations.append("Monitor traffic patterns closely")
        
        if congested_links:
            recommendations.append(f"Consider upgrading capacity on: {', '.join(congested_links[:3])}")
        
        if request.action == SimulationAction.ADD_LINK:
            recommendations.append("New link improves redundancy")
            recommendations.append("Configure appropriate routing metrics")
        
        if not recommendations:
            recommendations.append("Change appears safe to implement")
        
        return recommendations
    
    async def _cache_simulation(self, result: SimulationResult):
        """Cache simulation result in Redis."""
        try:
            redis_client = await self.redis_client
            import json
            data = result.model_dump(mode='json')
            await redis_client.setex(
                f"simulation:{result.simulation_id}",
                3600,  # 1 hour TTL
                json.dumps(data)
            )
        except Exception as e:
            logger.error("Failed to cache simulation result", error=str(e))
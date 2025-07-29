#!/usr/bin/env python3
"""
NetTwinSaaS - Backend Local (Sin Docker)
Servidor FastAPI simplificado para desarrollo local
"""

import asyncio
import json
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import networkx as nx
import numpy as np

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
import structlog

# Configurar logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configuración
app = FastAPI(
    title="NetTwinSaaS Local API",
    description="Network Digital Twin - Desarrollo Local",
    version="1.0.0-local"
)

# CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Almacenamiento en memoria (reemplaza Redis/Neo4j/ClickHouse)
memory_store = {
    "topology": {"nodes": [], "links": []},
    "simulations": {},
    "configs": {},
    "metrics": {},
    "users": {"demo": "demo"}  # usuario:password
}

# Modelos Pydantic
class LoginRequest(BaseModel):
    username: str
    password: str

class SimulationRequest(BaseModel):
    action: str  # add_link, remove_link, change_capacity
    src: str
    dst: str
    capacity: Optional[int] = 1000
    latency: Optional[float] = 5.0

class ConfigRequest(BaseModel):
    simulation_id: str
    targets: List[str]
    config_type: str = "qos"
    dry_run: bool = True

# Funciones auxiliares
def verify_token(token: str) -> str:
    """Verificar token (simplificado para demo)"""
    if token == "demo-token":
        return "demo"
    raise HTTPException(status_code=401, detail="Token inválido")

def generate_synthetic_topology():
    """Generar topología sintética de 5 routers"""
    nodes = []
    links = []
    
    # Crear nodos
    for i in range(1, 6):
        node = {
            "id": f"R{i}",
            "name": f"Router-{i}",
            "type": "router",
            "ip_address": f"192.168.1.{i}",
            "vendor": "Cisco" if i % 2 == 1 else "Juniper",
            "model": "ISR4331" if i % 2 == 1 else "SRX300",
            "status": "online"
        }
        nodes.append(node)
    
    # Crear enlaces
    connections = [
        ("R1", "R2", 1000, 0.65),
        ("R1", "R3", 1000, 0.45),
        ("R2", "R3", 500, 0.80),
        ("R2", "R4", 1000, 0.30),
        ("R3", "R4", 1000, 0.55),
        ("R3", "R5", 500, 0.70),
        ("R4", "R5", 1000, 0.40),
    ]
    
    for i, (src, dst, capacity, util) in enumerate(connections):
        link = {
            "id": f"link-{i+1}",
            "source": src,
            "target": dst,
            "capacity": capacity,
            "utilization": util,
            "latency": round(np.random.uniform(1, 10), 1),
            "status": "active"
        }
        links.append(link)
    
    return {"nodes": nodes, "links": links}

def simulate_network_change(topology, request: SimulationRequest):
    """Simular cambio en la red y calcular impacto"""
    # Crear grafo NetworkX
    G = nx.Graph()
    
    for node in topology["nodes"]:
        G.add_node(node["id"])
    
    for link in topology["links"]:
        G.add_edge(
            link["source"], 
            link["target"], 
            capacity=link["capacity"],
            utilization=link["utilization"]
        )
    
    # Aplicar cambio
    if request.action == "add_link":
        G.add_edge(request.src, request.dst, capacity=request.capacity, utilization=0.1)
    elif request.action == "remove_link":
        if G.has_edge(request.src, request.dst):
            G.remove_edge(request.src, request.dst)
    elif request.action == "change_capacity":
        if G.has_edge(request.src, request.dst):
            G[request.src][request.dst]["capacity"] = request.capacity
    
    # Calcular métricas de impacto
    is_connected = nx.is_connected(G)
    avg_path_length = nx.average_shortest_path_length(G) if is_connected else float('inf')
    
    # Simular pérdida de paquetes y latencia
    packet_loss = min(0.1, np.random.exponential(0.02))
    latency_increase = np.random.uniform(0.5, 8.0)
    
    # Determinar nivel de riesgo
    if not is_connected:
        risk_level = "critical"
    elif packet_loss > 0.05:
        risk_level = "high"
    elif packet_loss > 0.01:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return {
        "packet_loss": round(packet_loss, 4),
        "latency_increase": round(latency_increase, 1),
        "risk_level": risk_level,
        "network_connected": is_connected,
        "avg_path_length": round(avg_path_length, 2) if avg_path_length != float('inf') else None
    }

# Endpoints de la API

@app.get("/")
async def root():
    return {
        "service": "NetTwinSaaS Local API",
        "version": "1.0.0-local",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "healthy",
            "memory_store": "healthy"
        }
    }

@app.post("/api/v1/auth/login")
async def login(request: LoginRequest):
    """Autenticación simplificada"""
    if (request.username in memory_store["users"] and 
        memory_store["users"][request.username] == request.password):
        return {
            "access_token": "demo-token",
            "token_type": "bearer"
        }
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.post("/api/v1/discover")
async def discover_topology(token: str = Depends(security)):
    """Descubrir topología de red"""
    verify_token(token.credentials)
    
    logger.info("Iniciando descubrimiento de topología")
    
    # Simular tiempo de descubrimiento
    await asyncio.sleep(1)
    
    topology = generate_synthetic_topology()
    memory_store["topology"] = topology
    
    discovery_id = str(uuid.uuid4())
    
    return {
        "discovery_id": discovery_id,
        "status": "completed",
        "nodes_discovered": len(topology["nodes"]),
        "links_discovered": len(topology["links"]),
        "topology": topology
    }

@app.get("/api/v1/topology")
async def get_topology(token: str = Depends(security)):
    """Obtener topología actual"""
    verify_token(token.credentials)
    
    if not memory_store["topology"]["nodes"]:
        # Generar topología si no existe
        memory_store["topology"] = generate_synthetic_topology()
    
    return memory_store["topology"]

@app.post("/api/v1/simulate")
async def run_simulation(request: SimulationRequest, token: str = Depends(security)):
    """Ejecutar simulación what-if"""
    verify_token(token.credentials)
    
    logger.info("Ejecutando simulación", action=request.action, src=request.src, dst=request.dst)
    
    # Simular tiempo de procesamiento
    await asyncio.sleep(2)
    
    topology = memory_store["topology"]
    if not topology["nodes"]:
        topology = generate_synthetic_topology()
        memory_store["topology"] = topology
    
    impact = simulate_network_change(topology, request)
    
    simulation_id = str(uuid.uuid4())
    result = {
        "simulation_id": simulation_id,
        "status": "completed",
        "request": request.dict(),
        "impact_analysis": impact,
        "execution_time": 2.1,
        "created_at": datetime.now().isoformat()
    }
    
    memory_store["simulations"][simulation_id] = result
    
    return result

@app.get("/api/v1/simulations")
async def list_simulations(token: str = Depends(security)):
    """Listar simulaciones"""
    verify_token(token.credentials)
    
    simulations = list(memory_store["simulations"].values())
    return {"simulations": simulations, "total": len(simulations)}

@app.post("/api/v1/generate")
async def generate_config(request: ConfigRequest, token: str = Depends(security)):
    """Generar configuraciones"""
    verify_token(token.credentials)
    
    logger.info("Generando configuraciones", simulation_id=request.simulation_id)
    
    # Simular generación de configuración
    await asyncio.sleep(1.5)
    
    # Template QoS para Cisco
    cisco_qos_config = """
! QoS Configuration for VoIP Protection
! Generated by NetTwinSaaS
!
class-map match-any VOICE
 match dscp ef
 match protocol rtp audio
!
class-map match-any VIDEO  
 match dscp af41
 match dscp af42
!
policy-map WAN_OUT
 class VOICE
  priority percent 30
  set dscp ef
 class VIDEO
  bandwidth percent 25
  set dscp af41
 class class-default
  bandwidth percent 45
  random-detect
!
interface GigabitEthernet0/1
 service-policy output WAN_OUT
!
! End of configuration
"""
    
    job_id = str(uuid.uuid4())
    config_job = {
        "job_id": job_id,
        "status": "completed",
        "request": request.dict(),
        "generated_configs": {
            target: cisco_qos_config for target in request.targets
        },
        "created_at": datetime.now().isoformat(),
        "completed_at": datetime.now().isoformat()
    }
    
    memory_store["configs"][job_id] = config_job
    
    return config_job

@app.get("/api/v1/job/{job_id}/status")
async def get_config_status(job_id: str, token: str = Depends(security)):
    """Obtener estado de trabajo de configuración"""
    verify_token(token.credentials)
    
    if job_id not in memory_store["configs"]:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")
    
    return memory_store["configs"][job_id]

@app.get("/api/v1/metrics/system")
async def get_system_metrics(token: str = Depends(security)):
    """Obtener métricas del sistema"""
    verify_token(token.credentials)
    
    return {
        "cpu_usage": round(np.random.uniform(20, 80), 1),
        "memory_usage": round(np.random.uniform(40, 90), 1),
        "active_simulations": len([s for s in memory_store["simulations"].values() if s["status"] == "running"]),
        "completed_simulations": len([s for s in memory_store["simulations"].values() if s["status"] == "completed"]),
        "uptime_seconds": 3600,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/metrics/network")
async def get_network_metrics(token: str = Depends(security)):
    """Obtener métricas de red"""
    verify_token(token.credentials)
    
    topology = memory_store["topology"]
    if not topology["nodes"]:
        topology = generate_synthetic_topology()
    
    total_capacity = sum(link["capacity"] for link in topology["links"])
    avg_utilization = np.mean([link["utilization"] for link in topology["links"]])
    
    return {
        "total_nodes": len(topology["nodes"]),
        "total_links": len(topology["links"]),
        "average_utilization": round(avg_utilization, 3),
        "peak_utilization": round(max([link["utilization"] for link in topology["links"]], default=0), 3),
        "total_capacity": total_capacity,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando NetTwinSaaS Local API...")
    print("📖 Documentación: http://localhost:8001/docs")
    print("🔗 Health Check: http://localhost:8001/health")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
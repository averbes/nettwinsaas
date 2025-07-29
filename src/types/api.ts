// Tipos para las peticiones y respuestas de la API

export interface SimulationRequest {
  action: string;
  src: string;
  dst: string;
  capacity?: number;
  latency?: number;
  cost?: number;
  [key: string]: any; // Para propiedades adicionales
}

export interface SimulationResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  risk_level: 'low' | 'medium' | 'high';
  packet_loss: number;
  latency_increase: number;
  execution_time: number;
  created_at: string;
  results?: any; // Resultados detallados de la simulación
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'host' | 'firewall' | 'load_balancer' | 'unknown';
  status: 'up' | 'down' | 'degraded';
  properties: {
    ip_address?: string;
    model?: string;
    vendor?: string;
    os_version?: string;
    [key: string]: any;
  };
}

export interface TopologyLink {
  source: string;
  target: string;
  capacity: string; // Ej: '1G', '10G', '100M'
  utilization: number; // 0-100
  status: 'up' | 'down' | 'degraded';
  metrics?: {
    latency?: number; // ms
    jitter?: number; // ms
    packet_loss?: number; // porcentaje
    [key: string]: any;
  };
}

export interface NetworkStats {
  total_nodes: number;
  total_links: number;
  average_utilization: number;
  active_alerts: number;
  last_updated: string;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_simulations: number;
  completed_simulations: number;
  uptime: number; // segundos
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  source?: string;
  acknowledged: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  last_login?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    [key: string]: any;
  };
}

// Tipos para las respuestas paginadas
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos para los filtros de búsqueda
export interface SearchFilters {
  query?: string;
  status?: string[];
  type?: string[];
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

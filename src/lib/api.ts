import type { 
  SimulationRequest, 
  SimulationResult,
  SystemMetrics,
  Alert,
  TopologyNode,
  TopologyLink,
  PaginatedResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.authToken = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...(options.headers as HeadersInit)
      });

      const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          status: response.status
        };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  }

  // Authentication
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  clearAuth(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    if (DEMO_MODE) {
      this.setAuthToken('demo-token');
      return { token: 'demo-token' };
    }

    const response = await this.request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (response.error) throw new Error(response.error);
    if (!response.data?.token) throw new Error('No token received');

    this.setAuthToken(response.data.token);
    return response.data;
  }

  logout(): void {
    this.clearAuth();
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Topology Discovery
  async discoverTopology(): Promise<{ nodes: TopologyNode[]; links: TopologyLink[] }> {
    if (DEMO_MODE) {
      return {
        nodes: [
          { id: 'r1', name: 'Router 1', type: 'router', status: 'up' },
          { id: 's1', name: 'Switch 1', type: 'switch', status: 'up' }
        ],
        links: [
          { source: 'r1', target: 's1', status: 'up', bandwidth: 1000 }
        ]
      };
    }

    const response = await this.request<{ nodes: TopologyNode[]; links: TopologyLink[] }>('/topology');
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Simulation
  async runSimulation(request: SimulationRequest): Promise<SimulationResult> {
    if (DEMO_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: `sim-${Math.random().toString(36).substr(2, 9)}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            results: {
              nodes: [],
              links: [],
              metrics: {}
            }
          });
        }, 1000);
      });
    }

    const response = await this.request<SimulationResult>('/simulations', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getSimulationStatus(simulationId: string): Promise<SimulationResult> {
    const response = await this.request<SimulationResult>(`/simulations/${simulationId}`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getSimulationHistory(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<PaginatedResponse<SimulationResult>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);

    const response = await this.request<PaginatedResponse<SimulationResult>>(
      `/simulations?${query.toString()}`
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Alerts
  async getAlerts(params?: {
    limit?: number;
    offset?: number;
    severity?: string[];
    acknowledged?: boolean;
  }): Promise<PaginatedResponse<Alert>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.severity) params.severity.forEach(s => query.append('severity', s));
    if (params?.acknowledged !== undefined) query.append('acknowledged', params.acknowledged.toString());

    const response = await this.request<PaginatedResponse<Alert>>(
      `/alerts?${query.toString()}`
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/alerts/${alertId}/acknowledge`,
      { method: 'POST' }
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Metrics
  async getNetworkMetrics(timeRange: string = '1h'): Promise<SystemMetrics> {
    const response = await this.request<SystemMetrics>(
      `/metrics/network?timeRange=${timeRange}`
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }
}

export const api = new ApiClient();

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
const TOPOLOGY_API_URL = import.meta.env.VITE_TOPOLOGY_API_URL || 'http://localhost:8002'
const CONFIG_API_URL = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:8003'

// Create axios instances for different services
const whatIfApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Authorization': 'Bearer demo-token',
    'Content-Type': 'application/json',
  },
})

const topologyApi = axios.create({
  baseURL: `${TOPOLOGY_API_URL}/api/v1`,
  headers: {
    'Authorization': 'Bearer demo-token',
    'Content-Type': 'application/json',
  },
})

const configApi = axios.create({
  baseURL: `${CONFIG_API_URL}/api/v1`,
  headers: {
    'Authorization': 'Bearer demo-token',
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Authentication
  login: async (credentials: { username: string; password: string }) => {
    const response = await whatIfApi.post('/auth/login', credentials)
    return response.data
  },

  // System metrics
  getSystemMetrics: async () => {
    const response = await whatIfApi.get('/metrics/system')
    return response.data
  },

  getNetworkMetrics: async () => {
    const response = await whatIfApi.get('/metrics/network')
    return response.data
  },

  // Network topology
  getNetworkTopology: async () => {
    const response = await topologyApi.get('/topology')
    return response.data
  },

  discoverNetwork: async (request: any) => {
    const response = await topologyApi.post('/discover', request)
    return response.data
  },

  getDiscoveryStatus: async (discoveryId: string) => {
    const response = await topologyApi.get(`/discovery/${discoveryId}/status`)
    return response.data
  },

  // Simulations
  runSimulation: async (request: any) => {
    const response = await whatIfApi.post('/simulate', request)
    return response.data
  },

  getSimulationResults: async (simulationId: string) => {
    const response = await whatIfApi.get(`/simulation/${simulationId}/results`)
    return response.data
  },

  getSimulations: async () => {
    const response = await whatIfApi.get('/simulations')
    return response.data
  },

  // Configuration management
  generateConfigurations: async (request: any) => {
    const response = await configApi.post('/generate', request)
    return response.data
  },

  getConfigJobStatus: async (jobId: string) => {
    const response = await configApi.get(`/job/${jobId}/status`)
    return response.data
  },

  downloadConfigurations: async (jobId: string) => {
    const response = await configApi.get(`/job/${jobId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  deployConfigurations: async (request: any) => {
    const response = await configApi.post('/deploy', request)
    return response.data
  },

  getConfigJobs: async () => {
    // Mock implementation - in real app this would be an API call
    return []
  },

  // Device metrics
  getDeviceMetrics: async () => {
    // Mock implementation - in real app this would call collector service
    return {
      devices: ['R1', 'R2', 'R3', 'R4', 'R5'],
      total_devices: 5,
      online_devices: 5
    }
  },
}

// Add response interceptors for error handling
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    console.error('Unauthorized access - redirecting to login')
  } else if (error.response?.status >= 500) {
    // Handle server errors
    console.error('Server error:', error.response.data)
  }
  return Promise.reject(error)
}

whatIfApi.interceptors.response.use(
  (response) => response,
  handleApiError
)

topologyApi.interceptors.response.use(
  (response) => response,
  handleApiError
)

configApi.interceptors.response.use(
  (response) => response,
  handleApiError
)
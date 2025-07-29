import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Activity, 
  Server, 
  Wifi, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { api } from '../lib/api'

const Monitoring = () => {
  const { data: networkMetrics, refetch } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: () => api.getNetworkMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: deviceMetrics } = useQuery({
    queryKey: ['device-metrics'],
    queryFn: () => api.getDeviceMetrics(),
    refetchInterval: 30000,
  })

  // Mock historical data
  const utilizationData = [
    { time: '00:00', R1: 45, R2: 62, R3: 38, R4: 55, R5: 41 },
    { time: '04:00', R1: 52, R2: 58, R3: 42, R4: 48, R5: 39 },
    { time: '08:00', R1: 68, R2: 71, R3: 65, R4: 73, R5: 58 },
    { time: '12:00', R1: 73, R2: 75, R3: 78, R4: 81, R5: 67 },
    { time: '16:00', R1: 61, R2: 68, R3: 55, R4: 59, R5: 52 },
    { time: '20:00', R1: 49, R2: 64, R3: 41, R4: 47, R5: 43 },
  ]

  const interfaceData = [
    { interface: 'Gi0/0', utilization: 85, status: 'warning' },
    { interface: 'Gi0/1', utilization: 42, status: 'normal' },
    { interface: 'Se0/0/0', utilization: 67, status: 'normal' },
    { interface: 'Gi1/0', utilization: 91, status: 'critical' },
    { interface: 'Gi1/1', utilization: 23, status: 'normal' },
  ]

  const alerts = [
    {
      id: 1,
      severity: 'critical',
      message: 'High utilization on R4-Gi1/0',
      description: 'Interface utilization exceeded 90% threshold',
      time: '2 minutes ago',
      device: 'R4'
    },
    {
      id: 2,
      severity: 'warning',
      message: 'Link R2-R4 showing increased latency',
      description: 'Average latency increased to 15ms',
      time: '8 minutes ago',
      device: 'R2'
    },
    {
      id: 3,
      severity: 'info',
      message: 'Device R5 CPU usage normalized',
      description: 'CPU usage dropped below 70% threshold',
      time: '15 minutes ago',
      device: 'R5'
    }
  ]

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500'
    if (utilization >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network Monitoring</h1>
            <p className="mt-2 text-gray-600">
              Real-time monitoring of network performance and device health.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="btn btn-ghost px-4 py-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Health</p>
              <p className="text-2xl font-bold text-green-600">98.5%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="ml-2 text-sm font-medium text-green-600">+0.2%</span>
            <span className="ml-2 text-sm text-gray-500">from yesterday</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((networkMetrics?.average_utilization || 0.54) * 100)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Wifi className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="ml-2 text-sm font-medium text-green-600">-3.2%</span>
            <span className="ml-2 text-sm text-gray-500">from last hour</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-purple-600">
                {networkMetrics?.total_nodes || 5}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Server className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">All devices online</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-red-600">1 critical, 1 warning</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Utilization Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Utilization Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="R1" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="R2" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="R3" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="R4" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="R5" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interface Utilization */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interface Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interfaceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="interface" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilization" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Status */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Status</h3>
          <div className="space-y-4">
            {['R1', 'R2', 'R3', 'R4', 'R5'].map((device) => {
              const utilization = Math.floor(Math.random() * 40) + 30 // 30-70%
              const cpu = Math.floor(Math.random() * 30) + 40 // 40-70%
              const memory = Math.floor(Math.random() * 20) + 50 // 50-70%
              
              return (
                <div key={device} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device}</p>
                      <p className="text-sm text-gray-500">Router - Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">CPU:</span>
                      <span className="ml-1 font-medium">{cpu}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Memory:</span>
                      <span className="ml-1 font-medium">{memory}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Util:</span>
                      <span className="ml-1 font-medium">{utilization}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 p-1 rounded-full ${getAlertColor(alert.severity)}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500">Device: {alert.device}</span>
                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getAlertColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Monitoring
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Network, 
  Activity, 
  Zap, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { api } from '../lib/api'

const Dashboard = () => {
  // Mock data for demo
  const metricsData = [
    { time: '00:00', cpu: 45, memory: 62, utilization: 0.42 },
    { time: '04:00', cpu: 52, memory: 58, utilization: 0.38 },
    { time: '08:00', cpu: 68, memory: 71, utilization: 0.65 },
    { time: '12:00', cpu: 73, memory: 75, utilization: 0.78 },
    { time: '16:00', cpu: 61, memory: 68, utilization: 0.55 },
    { time: '20:00', cpu: 49, memory: 64, utilization: 0.41 },
  ]

  const { data: systemMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => api.getSystemMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: networkMetrics } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: () => api.getNetworkMetrics(),
    refetchInterval: 30000,
  })

  const stats = [
    {
      name: 'Network Devices',
      value: networkMetrics?.total_nodes || 5,
      change: '+2.5%',
      changeType: 'increase' as const,
      icon: Network,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Simulations',
      value: systemMetrics?.active_simulations || 2,
      change: '+12%',
      changeType: 'increase' as const,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Avg Utilization',
      value: `${Math.round((networkMetrics?.average_utilization || 0.54) * 100)}%`,
      change: '-3.2%',
      changeType: 'decrease' as const,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Configurations',
      value: systemMetrics?.completed_simulations || 156,
      change: '+8.1%',
      changeType: 'increase' as const,
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'simulation',
      title: 'Link capacity increased R1-R3',
      description: 'Simulation completed with low risk assessment',
      time: '5 minutes ago',
      status: 'completed',
      icon: Zap,
    },
    {
      id: 2,
      type: 'discovery',
      title: 'Network topology updated',
      description: 'Discovered 2 new network devices',
      time: '12 minutes ago',
      status: 'completed',
      icon: Network,
    },
    {
      id: 3,
      type: 'config',
      title: 'QoS configuration deployed',
      description: 'Applied to routers R1, R2, R3',
      time: '1 hour ago',
      status: 'deployed',
      icon: Settings,
    },
    {
      id: 4,
      type: 'alert',
      title: 'High utilization detected',
      description: 'Link R2-R4 showing 85% utilization',
      time: '2 hours ago',
      status: 'warning',
      icon: AlertTriangle,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'deployed':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'deployed':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      default:
        return Clock
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Network Digital Twin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor your network infrastructure and simulation activities in real-time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`h-4 w-4 ${
                stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={`ml-2 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">from last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Network Utilization Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="utilization" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Usage Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="CPU %"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Memory %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </button>
        </div>
        
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.map((activity, index) => {
              const StatusIcon = getStatusIcon(activity.status)
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== recentActivities.length - 1 && (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(activity.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
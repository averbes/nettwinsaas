import React from 'react'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Cpu,
  HardDrive
} from 'lucide-react'
import { useTranslations } from '../lib/i18n'

const Monitoring = () => {
  const { t } = useTranslations()
  
  // Mock monitoring data
  const metrics = [
    {
      name: 'Network Utilization',
      value: '67%',
      change: '+5%',
      trend: 'up',
      status: 'normal',
      icon: Activity,
    },
    {
      name: 'Packet Loss',
      value: '0.02%',
      change: '-0.01%',
      trend: 'down',
      status: 'good',
      icon: Wifi,
    },
    {
      name: 'Average Latency',
      value: '12.3ms',
      change: '+1.2ms',
      trend: 'up',
      status: 'normal',
      icon: Clock,
    },
    {
      name: 'CPU Usage',
      value: '45%',
      change: '-3%',
      trend: 'down',
      status: 'good',
      icon: Cpu,
    },
  ]

  const alerts = [
    {
      id: 1,
      severity: 'warning',
      message: 'High utilization on link R2-R5 (89%)',
      timestamp: '5 minutes ago',
      device: 'R2',
    },
    {
      id: 2,
      severity: 'info',
      message: 'BGP session established with R4',
      timestamp: '15 minutes ago',
      device: 'R1',
    },
    {
      id: 3,
      severity: 'critical',
      message: 'Interface GigE0/1 down on R3',
      timestamp: '1 hour ago',
      device: 'R3',
    },
  ]

  const deviceStatus = [
    { id: 'R1', name: 'Router-1', status: 'online', cpu: 34, memory: 67, uptime: '15d 4h' },
    { id: 'R2', name: 'Router-2', status: 'online', cpu: 45, memory: 72, uptime: '12d 8h' },
    { id: 'R3', name: 'Router-3', status: 'warning', cpu: 78, memory: 89, uptime: '8d 2h' },
    { id: 'R4', name: 'Router-4', status: 'online', cpu: 23, memory: 45, uptime: '20d 1h' },
    { id: 'R5', name: 'Router-5', status: 'online', cpu: 56, memory: 61, uptime: '18d 6h' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'normal':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: string, status: string) => {
    if (status === 'good') return 'text-green-600'
    if (trend === 'up') return 'text-red-600'
    return 'text-green-600'
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle
      case 'warning':
        return AlertTriangle
      case 'info':
        return CheckCircle
      default:
        return CheckCircle
    }
  }

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

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'offline':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.monitoringTitle}</h1>
        <p className="mt-2 text-gray-600">
          {t.monitoringDescription}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend)
          
          return (
            <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <metric.icon className={`h-6 w-6 ${getStatusColor(metric.status)}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {metric.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metric.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(metric.trend, metric.status)}`}>
                          <TrendIcon className="self-center flex-shrink-0 h-4 w-4" />
                          <span className="ml-1">{metric.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.severity)
                
                return (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-1 rounded-full ${getAlertColor(alert.severity)}`}>
                      <AlertIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{alert.device}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Device Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {deviceStatus.map((device) => (
                <div key={device.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <HardDrive className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">Uptime: {device.uptime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">CPU: {device.cpu}%</div>
                      <div className="text-xs text-gray-500">Mem: {device.memory}%</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeviceStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Performance charts would be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Integration with time-series database for real-time metrics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Monitoring
import { useEffect, useState, useCallback } from 'react';
import { 
  Network, 
  Zap, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Cpu,
  HardDrive,
  Database,
  BellRing,
  RefreshCw
} from 'lucide-react';
import { format, subHours } from 'date-fns';
import { useTranslations } from '../lib/i18n';
import { SystemStats } from '../components/SystemStats';
import { AlertsPanel, AlertItem } from '../components/AlertsPanel';
// Utilidad para combinar clases de Tailwind
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Generate mock data for network utilization
const generateNetworkData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = subHours(now, i);
    const hour = timestamp.getHours();
    
    // Simulate daily patterns
    const dailyPattern = 0.3 + 0.5 * Math.sin((hour - 9) / 24 * Math.PI * 2) * 0.5;
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    const utilization = Math.min(0.95, Math.max(0.1, dailyPattern * randomFactor));
    const throughput = 10 * utilization * (0.9 + Math.random() * 0.2);
    
    data.push({
      timestamp,
      utilization,
      throughput
    });
  }
  
  return data;
};

// Mock data for alerts
const mockAlerts: AlertItem[] = [
  {
    id: 1,
    title: 'High CPU Usage',
    description: 'CPU usage on router R1 is above 90%',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    severity: 'high',
    acknowledged: false,
    source: 'Router R1'
  },
  {
    id: 2,
    title: 'Link Down',
    description: 'Link between R2 and R3 is down',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    severity: 'critical',
    acknowledged: true,
    source: 'Network'
  },
  {
    id: 3,
    title: 'High Latency',
    description: 'Latency to core network is above threshold',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    severity: 'medium',
    acknowledged: false,
    source: 'Network'
  },
  {
    id: 4,
    title: 'New Firmware Available',
    description: 'New firmware version 2.5.3 is available for your devices',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    severity: 'info',
    acknowledged: false,
    source: 'System'
  }
];

const Dashboard = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkMetrics, setNetworkMetrics] = useState({
    totalNodes: 12,
    activeLinks: 24,
    averageUtilization: 0.54,
    packetLoss: 0.02,
    latency: 42,
    throughput: 4.72,
  });
  
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0.65,
    memoryUsage: 0.48,
    diskUsage: 0.32,
    activeSimulations: 2,
    completedSimulations: 156,
    alerts: mockAlerts.filter(alert => !alert.acknowledged).length,
  });
  
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [networkData, setNetworkData] = useState(generateNetworkData());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  
  const handleAcknowledgeAlert = useCallback((alertId: string | number) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    
    // Update the alerts count
    setSystemMetrics(prev => ({
      ...prev,
      alerts: prev.alerts - 1
    }));
  }, []);
  
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simular una llamada a la API
    setTimeout(() => {
      // Actualizar los datos de la red
      setNetworkData(generateNetworkData());
      // Actualizar la hora de última actualización
      setLastUpdated(new Date());
      // Actualizar métricas del sistema
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(1, Math.max(0.1, Math.random() * 0.5 + 0.3)),
        memoryUsage: Math.min(1, Math.max(0.2, Math.random() * 0.6)),
        diskUsage: Math.min(1, Math.max(0.1, Math.random() * 0.4))
      }));
      setIsRefreshing(false);
    }, 1000);
  }, []);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data for demo
  const stats = [
    {
      name: t.networkNodes || 'Network Nodes',
      value: networkMetrics.total_nodes,
      change: '+2.5%',
      changeType: 'increase' as const,
      icon: Network,
    },
    {
      name: t.activeLinks || 'Active Links',
      value: systemMetrics.active_simulations,
      change: '+12%',
      changeType: 'increase' as const,
      icon: Activity,
    },
    {
      name: t.simulationsRun,
      value: `${Math.round((networkMetrics?.average_utilization || 0.54) * 100)}%`,
      change: '-3.2%',
      changeType: 'decrease' as const,
      icon: Zap,
    },
    {
      name: t.configsGenerated,
      value: systemMetrics?.completed_simulations || 156,
      change: '+8.1%',
      changeType: 'increase' as const,
      icon: Settings,
    },
  ]

  const recentSimulations = [
    {
      id: 1,
      action: 'Add Link R1-R3',
      status: 'completed',
      risk: 'low',
      timestamp: '2 minutes ago',
    },
    {
      id: 2,
      action: 'Increase Capacity R2-R4',
      status: 'completed',
      risk: 'medium',
      timestamp: '15 minutes ago',
    },
    {
      id: 3,
      action: 'Remove Link R3-R5',
      status: 'running',
      risk: 'high',
      timestamp: '1 hour ago',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'running':
        return Clock
      default:
        return AlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-red-600'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Network Twin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ... */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Network Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Health</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Utilization</span>
                <span className="text-sm font-medium text-gray-900">67%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Packet Loss</span>
                <span className="text-sm font-medium text-gray-900">0.02%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Latency</span>
                <span className="text-sm font-medium text-gray-900">12.3ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Simulations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Simulations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSimulations.map((simulation) => {
                const StatusIcon = getStatusIcon(simulation.status)
                return (
                  <div key={simulation.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(simulation.status)}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {simulation.action}
                        </p>
                        <p className="text-xs text-gray-500">{simulation.timestamp}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(simulation.risk)}`}>
                      {simulation.risk} risk
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Network className="h-5 w-5 mr-2 text-gray-400" />
                Discover Topology
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Zap className="h-5 w-5 mr-2 text-gray-400" />
                Run Simulation
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Generate Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
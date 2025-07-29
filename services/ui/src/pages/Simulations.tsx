import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { 
  Zap, 
  Plus, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Settings
} from 'lucide-react'
import { api } from '../lib/api'

const Simulations = () => {
  const [showNewSimulation, setShowNewSimulation] = React.useState(false)
  const [simulationForm, setSimulationForm] = React.useState({
    action: 'add_link',
    src: '',
    dst: '',
    capacity: 1000,
    latency: 5,
    cost: 100
  })

  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => api.getSimulations(),
  })

  const runSimulationMutation = useMutation({
    mutationFn: (request: any) => api.runSimulation(request),
    onSuccess: () => {
      setShowNewSimulation(false)
      setSimulationForm({
        action: 'add_link',
        src: '',
        dst: '',
        capacity: 1000,
        latency: 5,
        cost: 100
      })
    }
  })

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault()
    runSimulationMutation.mutate(simulationForm)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'failed':
        return AlertCircle
      case 'running':
        return Clock
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'running':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Mock simulation data
  const mockSimulations = [
    {
      id: 'sim-001',
      action: 'add_link',
      src: 'R1',
      dst: 'R3',
      capacity: 1000,
      status: 'completed',
      risk_level: 'low',
      packet_loss: 0.05,
      latency_increase: 2.1,
      created_at: '2024-01-15T10:30:00Z',
      execution_time: 1.2
    },
    {
      id: 'sim-002',
      action: 'remove_link',
      src: 'R2',
      dst: 'R4',
      status: 'completed',
      risk_level: 'medium',
      packet_loss: 0.12,
      latency_increase: 5.8,
      created_at: '2024-01-15T09:15:00Z',
      execution_time: 0.8
    },
    {
      
      id: 'sim-003',
      action: 'change_capacity',
      src: 'R1',
      dst: 'R2',
      capacity: 2000,
      status: 'running',
      created_at: '2024-01-15T10:45:00Z'
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network Simulations</h1>
            <p className="mt-2 text-gray-600">
              Run "what-if" scenarios to analyze network changes before implementation.
            </p>
          </div>
          <button
            onClick={() => setShowNewSimulation(true)}
            className="btn btn-primary px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Simulation
          </button>
        </div>
      </div>

      {/* New Simulation Modal */}
      {showNewSimulation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowNewSimulation(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Simulation</h3>
              
              <form onSubmit={handleRunSimulation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={simulationForm.action}
                    onChange={(e) => setSimulationForm({...simulationForm, action: e.target.value})}
                    className="input w-full"
                  >
                    <option value="add_link">Add Link</option>
                    <option value="remove_link">Remove Link</option>
                    <option value="change_capacity">Change Capacity</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Node
                    </label>
                    <select
                      value={simulationForm.src}
                      onChange={(e) => setSimulationForm({...simulationForm, src: e.target.value})}
                      className="input w-full"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="R1">R1</option>
                      <option value="R2">R2</option>
                      <option value="R3">R3</option>
                      <option value="R4">R4</option>
                      <option value="R5">R5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Node
                    </label>
                    <select
                      value={simulationForm.dst}
                      onChange={(e) => setSimulationForm({...simulationForm, dst: e.target.value})}
                      className="input w-full"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="R1">R1</option>
                      <option value="R2">R2</option>
                      <option value="R3">R3</option>
                      <option value="R4">R4</option>
                      <option value="R5">R5</option>
                    </select>
                  </div>
                </div>

                {simulationForm.action !== 'remove_link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (Mbps)
                    </label>
                    <input
                      type="number"
                      value={simulationForm.capacity}
                      onChange={(e) => setSimulationForm({...simulationForm, capacity: parseInt(e.target.value)})}
                      className="input w-full"
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewSimulation(false)}
                    className="btn btn-ghost px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={runSimulationMutation.isPending}
                    className="btn btn-primary px-4 py-2"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {runSimulationMutation.isPending ? 'Running...' : 'Run Simulation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Simulations List */}
      <div className="space-y-6">
        {mockSimulations.map((simulation) => {
          const StatusIcon = getStatusIcon(simulation.status)
          
          return (
            <div key={simulation.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {simulation.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(simulation.status)}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {simulation.status}
                      </span>
                      {simulation.risk_level && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(simulation.risk_level)}`}>
                          {simulation.risk_level} risk
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="font-medium">{simulation.src}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="font-medium">{simulation.dst}</span>
                      {simulation.capacity && (
                        <span className="ml-4 text-gray-500">
                          {simulation.capacity} Mbps
                        </span>
                      )}
                    </div>

                    {simulation.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Packet Loss:</span>
                          <span className="ml-2 font-medium">{simulation.packet_loss}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Latency Impact:</span>
                          <span className="ml-2 font-medium">+{simulation.latency_increase}ms</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(simulation.created_at).toLocaleString()}</div>
                    {simulation.execution_time && (
                      <div>{simulation.execution_time}s execution</div>
                    )}
                  </div>
                  
                  {simulation.status === 'completed' && (
                    <button className="btn btn-ghost p-2">
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {simulation.status === 'completed' && simulation.risk_level === 'low' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Simulation completed successfully - safe to implement
                    </div>
                    <button className="btn btn-primary px-4 py-2 text-sm">
                      Generate Config
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {mockSimulations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations yet</h3>
          <p className="text-gray-500 mb-4">
            Start by running your first network simulation to analyze potential changes.
          </p>
          <button
            onClick={() => setShowNewSimulation(true)}
            className="btn btn-primary px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Run First Simulation
          </button>
        </div>
      )}
    </div>
  )
}

export default Simulations
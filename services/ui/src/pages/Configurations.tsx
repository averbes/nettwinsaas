import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { 
  Settings, 
  Plus, 
  Download, 
  Play, 
  CheckCircle, 
  Clock,
  AlertCircle,
  FileText,
  Server
} from 'lucide-react'
import { api } from '../lib/api'

const Configurations = () => {
  const [showNewConfig, setShowNewConfig] = React.useState(false)
  const [configForm, setConfigForm] = React.useState({
    simulation_id: '',
    targets: [] as string[],
    config_type: 'qos',
    dry_run: true,
    priority: 'medium'
  })

  const { data: configJobs } = useQuery({
    queryKey: ['config-jobs'],
    queryFn: () => api.getConfigJobs(),
  })

  const generateConfigMutation = useMutation({
    mutationFn: (request: any) => api.generateConfigurations(request),
    onSuccess: () => {
      setShowNewConfig(false)
      setConfigForm({
        simulation_id: '',
        targets: [],
        config_type: 'qos',
        dry_run: true,
        priority: 'medium'
      })
    }
  })

  const handleGenerateConfig = (e: React.FormEvent) => {
    e.preventDefault()
    generateConfigMutation.mutate(configForm)
  }

  const handleTargetChange = (target: string, checked: boolean) => {
    if (checked) {
      setConfigForm({
        ...configForm,
        targets: [...configForm.targets, target]
      })
    } else {
      setConfigForm({
        ...configForm,
        targets: configForm.targets.filter(t => t !== target)
      })
    }
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

  // Mock configuration jobs data
  const mockConfigJobs = [
    {
      id: 'job-001',
      simulation_id: 'sim-001',
      config_type: 'qos',
      targets: ['R1', 'R3'],
      status: 'completed',
      dry_run: true,
      created_at: '2024-01-15T10:35:00Z',
      completed_at: '2024-01-15T10:36:00Z',
      configs_generated: 2
    },
    {
      id: 'job-002',
      simulation_id: 'sim-002',
      config_type: 'routing',
      targets: ['R2', 'R4', 'R5'],
      status: 'running',
      dry_run: false,
      created_at: '2024-01-15T10:40:00Z',
      configs_generated: 0
    },
    {
      id: 'job-003',
      simulation_id: 'sim-001',
      config_type: 'security',
      targets: ['R1', 'R2'],
      status: 'failed',
      dry_run: true,
      created_at: '2024-01-15T09:20:00Z',
      completed_at: '2024-01-15T09:21:00Z',
      error: 'Template not found for security configuration'
    }
  ]

  const availableTargets = ['R1', 'R2', 'R3', 'R4', 'R5']

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration Management</h1>
            <p className="mt-2 text-gray-600">
              Generate and deploy network configurations based on simulation results.
            </p>
          </div>
          <button
            onClick={() => setShowNewConfig(true)}
            className="btn btn-primary px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Config
          </button>
        </div>
      </div>

      {/* New Configuration Modal */}
      {showNewConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowNewConfig(false)} />
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Configuration</h3>
              
              <form onSubmit={handleGenerateConfig} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Simulation ID
                  </label>
                  <input
                    type="text"
                    value={configForm.simulation_id}
                    onChange={(e) => setConfigForm({...configForm, simulation_id: e.target.value})}
                    className="input w-full"
                    placeholder="sim-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration Type
                  </label>
                  <select
                    value={configForm.config_type}
                    onChange={(e) => setConfigForm({...configForm, config_type: e.target.value})}
                    className="input w-full"
                  >
                    <option value="qos">QoS Configuration</option>
                    <option value="routing">Routing Configuration</option>
                    <option value="security">Security Configuration</option>
                    <option value="interface">Interface Configuration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Devices
                  </label>
                  <div className="space-y-2">
                    {availableTargets.map((target) => (
                      <label key={target} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={configForm.targets.includes(target)}
                          onChange={(e) => handleTargetChange(target, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{target}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={configForm.priority}
                    onChange={(e) => setConfigForm({...configForm, priority: e.target.value})}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dry_run"
                    checked={configForm.dry_run}
                    onChange={(e) => setConfigForm({...configForm, dry_run: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="dry_run" className="ml-2 text-sm text-gray-700">
                    Dry run (generate only, don't deploy)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewConfig(false)}
                    className="btn btn-ghost px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generateConfigMutation.isPending || configForm.targets.length === 0}
                    className="btn btn-primary px-4 py-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {generateConfigMutation.isPending ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Jobs List */}
      <div className="space-y-6">
        {mockConfigJobs.map((job) => {
          const StatusIcon = getStatusIcon(job.status)
          
          return (
            <div key={job.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Settings className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {job.config_type.toUpperCase()} Configuration
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {job.status}
                      </span>
                      {job.dry_run && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Dry Run
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span>Simulation: {job.simulation_id}</span>
                      <span className="mx-2">•</span>
                      <span>Targets: {job.targets.join(', ')}</span>
                    </div>

                    {job.status === 'completed' && (
                      <div className="text-sm text-gray-600">
                        <span>{job.configs_generated} configurations generated</span>
                      </div>
                    )}

                    {job.status === 'failed' && job.error && (
                      <div className="text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {job.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-500">
                    <div>Created: {new Date(job.created_at).toLocaleString()}</div>
                    {job.completed_at && (
                      <div>Completed: {new Date(job.completed_at).toLocaleString()}</div>
                    )}
                  </div>
                  
                  {job.status === 'completed' && (
                    <div className="flex space-x-2">
                      <button className="btn btn-ghost p-2" title="Download Configurations">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="btn btn-ghost p-2" title="View Configurations">
                        <FileText className="h-4 w-4" />
                      </button>
                      {!job.dry_run && (
                        <button className="btn btn-ghost p-2" title="Deploy">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {job.status === 'completed' && !job.dry_run && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-blue-600">
                      <Server className="h-4 w-4 mr-2" />
                      Ready for deployment to {job.targets.length} device{job.targets.length !== 1 ? 's' : ''}
                    </div>
                    <button className="btn btn-primary px-4 py-2 text-sm">
                      <Play className="h-4 w-4 mr-2" />
                      Deploy Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {mockConfigJobs.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations yet</h3>
          <p className="text-gray-500 mb-4">
            Generate network configurations based on your simulation results.
          </p>
          <button
            onClick={() => setShowNewConfig(true)}
            className="btn btn-primary px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate First Config
          </button>
        </div>
      )}
    </div>
  )
}

export default Configurations
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Network, Router, Wifi, RefreshCw, Eye } from 'lucide-react'
import { api } from '../lib/api'

const Topology = () => {
  const { data: topology, isLoading, refetch } = useQuery({
    queryKey: ['network-topology'],
    queryFn: () => api.getNetworkTopology(),
  })

  const [selectedNode, setSelectedNode] = React.useState<any>(null)
  const [viewMode, setViewMode] = React.useState<'graph' | 'table'>('graph')

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router':
        return Router
      case 'switch':
        return Network
      default:
        return Wifi
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 0.5) return 'text-green-600 bg-green-100'
    if (utilization < 0.8) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network Topology</h1>
            <p className="mt-2 text-gray-600">
              Visualize and explore your network infrastructure topology.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
              className="btn btn-ghost px-4 py-2"
            >
              <Eye className="h-4 w-4 mr-2" />
              {viewMode === 'graph' ? 'Table View' : 'Graph View'}
            </button>
            <button
              onClick={() => refetch()}
              className="btn btn-primary px-4 py-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Topology Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <Network className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Nodes</p>
              <p className="text-2xl font-bold text-gray-900">
                {topology?.nodes?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <Wifi className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-gray-900">
                {topology?.links?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <Router className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Routers</p>
              <p className="text-2xl font-bold text-gray-900">
                {topology?.nodes?.filter(n => n.type === 'router').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'graph' ? (
        /* Graph View - Simplified visualization */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Network Graph */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Network Graph</h3>
              <div className="bg-gray-50 rounded-lg p-8 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Interactive network topology visualization
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {topology?.nodes?.length || 0} nodes, {topology?.links?.length || 0} links
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Node Details */}
          <div>
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Node Details</h3>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Node ID</p>
                    <p className="text-sm text-gray-900">{selectedNode.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedNode.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm text-gray-900">{selectedNode.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendor</p>
                    <p className="text-sm text-gray-900">{selectedNode.vendor}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a node to view details</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-8">
          {/* Nodes Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Network Nodes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topology?.nodes?.map((node: any) => {
                    const NodeIcon = getNodeIcon(node.type)
                    return (
                      <tr key={node.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <NodeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{node.name}</div>
                              <div className="text-sm text-gray-500">{node.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {node.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {node.ip_address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {node.vendor || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Online
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Links Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Network Links</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topology?.links?.map((link: any) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {link.source} ↔ {link.target}
                        </div>
                        <div className="text-sm text-gray-500">{link.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.capacity} Mbps
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  link.utilization < 0.5 
                                    ? 'bg-green-500' 
                                    : link.utilization < 0.8 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${link.utilization * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-gray-900">
                            {Math.round(link.utilization * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.latency}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Topology
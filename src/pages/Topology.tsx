import React from 'react'
import { Network, RefreshCw, Download, Settings } from 'lucide-react'
import { useTranslations } from '../lib/i18n'

const Topology = () => {
  const { t } = useTranslations()
  
  const [isDiscovering, setIsDiscovering] = React.useState(false)

  const handleDiscoverTopology = () => {
    setIsDiscovering(true)
    // Simulate discovery process
    setTimeout(() => {
      setIsDiscovering(false)
    }, 3000)
  }

  // Mock topology data
  const nodes = [
    { id: 'R1', name: 'Router-1', type: 'router', x: 200, y: 100, status: 'active' },
    { id: 'R2', name: 'Router-2', type: 'router', x: 400, y: 100, status: 'active' },
    { id: 'R3', name: 'Router-3', type: 'router', x: 300, y: 200, status: 'active' },
    { id: 'R4', name: 'Router-4', type: 'router', x: 100, y: 250, status: 'active' },
    { id: 'R5', name: 'Router-5', type: 'router', x: 500, y: 250, status: 'active' },
  ]

  const links = [
    { source: 'R1', target: 'R2', capacity: '1Gbps', utilization: 45 },
    { source: 'R1', target: 'R3', capacity: '1Gbps', utilization: 67 },
    { source: 'R2', target: 'R3', capacity: '1Gbps', utilization: 23 },
    { source: 'R2', target: 'R5', capacity: '1Gbps', utilization: 78 },
    { source: 'R3', target: 'R4', capacity: '1Gbps', utilization: 34 },
    { source: 'R3', target: 'R5', capacity: '1Gbps', utilization: 56 },
    { source: 'R4', target: 'R1', capacity: '1Gbps', utilization: 89 },
  ]

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'stroke-green-500'
    if (utilization < 80) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }

  const getUtilizationWidth = (utilization: number) => {
    if (utilization < 50) return '2'
    if (utilization < 80) return '3'
    return '4'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.topologyTitle}</h1>
            <p className="mt-2 text-gray-600">
              {t.topologyDescription}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDiscoverTopology}
              disabled={isDiscovering}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isDiscovering ? 'animate-spin' : ''}`} />
              {isDiscovering ? 'Discovering...' : 'Discover'}
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Network Graph</h3>
        </div>
        <div className="p-6">
          <div className="relative bg-gray-50 rounded-lg" style={{ height: '400px' }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Links */}
              {links.map((link, index) => {
                const sourceNode = nodes.find(n => n.id === link.source)
                const targetNode = nodes.find(n => n.id === link.target)
                if (!sourceNode || !targetNode) return null

                return (
                  <g key={index}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      className={getUtilizationColor(link.utilization)}
                      strokeWidth={getUtilizationWidth(link.utilization)}
                    />
                    {/* Link label */}
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 5}
                      className="text-xs fill-gray-600"
                      textAnchor="middle"
                    >
                      {link.utilization}%
                    </text>
                  </g>
                )
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    className="fill-blue-500 stroke-blue-700"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 35}
                    className="text-sm fill-gray-900 font-medium"
                    textAnchor="middle"
                  >
                    {node.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Network Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nodes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Network Nodes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Network className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{node.name}</p>
                      <p className="text-xs text-gray-500">{node.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-xs text-green-600">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
                      {node.status}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Network Links</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {link.source} ↔ {link.target}
                    </p>
                    <p className="text-xs text-gray-500">{link.capacity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{link.utilization}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            link.utilization < 50 ? 'bg-green-500' :
                            link.utilization < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${link.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topology
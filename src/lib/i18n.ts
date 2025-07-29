// Configuración de internacionalización para NetTwinSaaS
export type Language = 'en' | 'es'

export interface Translations {
  // Navigation
  dashboard: string
  topology: string
  simulations: string
  configurations: string
  monitoring: string
  
  // Common
  loading: string
  error: string
  success: string
  cancel: string
  save: string
  delete: string
  edit: string
  view: string
  refresh: string
  download: string
  deploy: string
  
  // Dashboard
  welcomeTitle: string
  welcomeDescription: string
  networkNodes: string
  activeLinks: string
  simulationsRun: string
  configsGenerated: string
  networkStatus: string
  recentSimulations: string
  quickActions: string
  discoverTopology: string
  runSimulation: string
  generateConfig: string
  
  // Topology
  topologyTitle: string
  topologyDescription: string
  networkGraph: string
  nodeDetails: string
  networkLinks: string
  totalNodes: string
  activeLinksCount: string
  routers: string
  
  // Simulations
  simulationsTitle: string
  simulationsDescription: string
  newSimulation: string
  actionType: string
  sourceNode: string
  destinationNode: string
  capacity: string
  addLink: string
  removeLink: string
  changeCapacity: string
  runSimulationBtn: string
  packetLoss: string
  latencyImpact: string
  riskLevel: string
  low: string
  medium: string
  high: string
  critical: string
  
  // Configurations
  configurationsTitle: string
  configurationsDescription: string
  generateConfigurations: string
  configType: string
  targetDevices: string
  priority: string
  dryRun: string
  
  // Monitoring
  monitoringTitle: string
  monitoringDescription: string
  networkHealth: string
  avgUtilization: string
  activeDevices: string
  activeAlerts: string
  deviceStatus: string
  
  // Status
  online: string
  offline: string
  running: string
  completed: string
  failed: string
  pending: string
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    topology: 'Network Topology',
    simulations: 'Simulations',
    configurations: 'Configurations',
    monitoring: 'Monitoring',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    refresh: 'Refresh',
    download: 'Download',
    deploy: 'Deploy',
    
    // Dashboard
    welcomeTitle: 'Welcome to NetTwinSaaS',
    welcomeDescription: 'Your network digital twin dashboard - simulate, analyze, and deploy with confidence.',
    networkNodes: 'Network Devices',
    activeLinks: 'Active Simulations',
    simulationsRun: 'Avg Utilization',
    configsGenerated: 'Configurations',
    networkStatus: 'Network Status',
    recentSimulations: 'Recent Activity',
    quickActions: 'Quick Actions',
    discoverTopology: 'Discover Topology',
    runSimulation: 'Run Simulation',
    generateConfig: 'Generate Config',
    
    // Topology
    topologyTitle: 'Network Topology',
    topologyDescription: 'Visualize and explore your network infrastructure topology.',
    networkGraph: 'Network Graph',
    nodeDetails: 'Node Details',
    networkLinks: 'Network Links',
    totalNodes: 'Total Nodes',
    activeLinksCount: 'Active Links',
    routers: 'Routers',
    
    // Simulations
    simulationsTitle: 'Network Simulations',
    simulationsDescription: 'Run "what-if" scenarios to analyze network changes before implementation.',
    newSimulation: 'New Simulation',
    actionType: 'Action Type',
    sourceNode: 'Source Node',
    destinationNode: 'Destination Node',
    capacity: 'Capacity (Mbps)',
    addLink: 'Add Link',
    removeLink: 'Remove Link',
    changeCapacity: 'Change Capacity',
    runSimulationBtn: 'Run Simulation',
    packetLoss: 'Packet Loss',
    latencyImpact: 'Latency Impact',
    riskLevel: 'Risk Level',
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
    
    // Configurations
    configurationsTitle: 'Configuration Management',
    configurationsDescription: 'Generate and deploy network configurations based on simulation results.',
    generateConfigurations: 'Generate Config',
    configType: 'Configuration Type',
    targetDevices: 'Target Devices',
    priority: 'Priority',
    dryRun: 'Dry run (generate only, don\'t deploy)',
    
    // Monitoring
    monitoringTitle: 'Network Monitoring',
    monitoringDescription: 'Real-time monitoring of network performance and device health.',
    networkHealth: 'Network Health',
    avgUtilization: 'Avg Utilization',
    activeDevices: 'Active Devices',
    activeAlerts: 'Active Alerts',
    deviceStatus: 'Device Status',
    
    // Status
    online: 'Online',
    offline: 'Offline',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    pending: 'Pending',
  },
  
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    topology: 'Topología de Red',
    simulations: 'Simulaciones',
    configurations: 'Configuraciones',
    monitoring: 'Monitoreo',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    refresh: 'Actualizar',
    download: 'Descargar',
    deploy: 'Desplegar',
    
    // Dashboard
    welcomeTitle: 'Bienvenido a NetTwinSaaS',
    welcomeDescription: 'Tu panel de gemelo digital de red - simula, analiza y despliega con confianza.',
    networkNodes: 'Dispositivos de Red',
    activeLinks: 'Simulaciones Activas',
    simulationsRun: 'Utilización Promedio',
    configsGenerated: 'Configuraciones',
    networkStatus: 'Estado de la Red',
    recentSimulations: 'Actividad Reciente',
    quickActions: 'Acciones Rápidas',
    discoverTopology: 'Descubrir Topología',
    runSimulation: 'Ejecutar Simulación',
    generateConfig: 'Generar Configuración',
    
    // Topology
    topologyTitle: 'Topología de Red',
    topologyDescription: 'Visualiza y explora la topología de tu infraestructura de red.',
    networkGraph: 'Grafo de Red',
    nodeDetails: 'Detalles del Nodo',
    networkLinks: 'Enlaces de Red',
    totalNodes: 'Nodos Totales',
    activeLinksCount: 'Enlaces Activos',
    routers: 'Routers',
    
    // Simulations
    simulationsTitle: 'Simulaciones de Red',
    simulationsDescription: 'Ejecuta escenarios "qué pasaría si" para analizar cambios de red antes de implementarlos.',
    newSimulation: 'Nueva Simulación',
    actionType: 'Tipo de Acción',
    sourceNode: 'Nodo Origen',
    destinationNode: 'Nodo Destino',
    capacity: 'Capacidad (Mbps)',
    addLink: 'Agregar Enlace',
    removeLink: 'Eliminar Enlace',
    changeCapacity: 'Cambiar Capacidad',
    runSimulationBtn: 'Ejecutar Simulación',
    packetLoss: 'Pérdida de Paquetes',
    latencyImpact: 'Impacto en Latencia',
    riskLevel: 'Nivel de Riesgo',
    low: 'bajo',
    medium: 'medio',
    high: 'alto',
    critical: 'crítico',
    
    // Configurations
    configurationsTitle: 'Gestión de Configuraciones',
    configurationsDescription: 'Genera y despliega configuraciones de red basadas en resultados de simulación.',
    generateConfigurations: 'Generar Configuración',
    configType: 'Tipo de Configuración',
    targetDevices: 'Dispositivos Objetivo',
    priority: 'Prioridad',
    dryRun: 'Ejecución en seco (solo generar, no desplegar)',
    
    // Monitoring
    monitoringTitle: 'Monitoreo de Red',
    monitoringDescription: 'Monitoreo en tiempo real del rendimiento de red y salud de dispositivos.',
    networkHealth: 'Salud de la Red',
    avgUtilization: 'Utilización Promedio',
    activeDevices: 'Dispositivos Activos',
    activeAlerts: 'Alertas Activas',
    deviceStatus: 'Estado de Dispositivos',
    
    // Status
    online: 'En línea',
    offline: 'Fuera de línea',
    running: 'Ejecutándose',
    completed: 'Completado',
    failed: 'Fallido',
    pending: 'Pendiente',
  }
}

// Hook para usar traducciones
export const useTranslations = () => {
  const [language, setLanguage] = React.useState<Language>(() => {
    // Detectar idioma del navegador
    const browserLang = navigator.language.toLowerCase()
    return browserLang.startsWith('es') ? 'es' : 'en'
  })

  const t = translations[language]

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en')
  }

  return { t, language, setLanguage, toggleLanguage }
}

// Para usar en componentes sin hooks
export const getTranslations = (language: Language): Translations => {
  return translations[language]
}

import React from 'react'
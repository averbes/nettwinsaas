import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Topology from './pages/Topology'
import Simulations from './pages/Simulations'
import Configurations from './pages/Configurations'
import Monitoring from './pages/Monitoring'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/simulations" element={<Simulations />} />
        <Route path="/configurations" element={<Configurations />} />
        <Route path="/monitoring" element={<Monitoring />} />
      </Routes>
    </Layout>
  )
}

export default App
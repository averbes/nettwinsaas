import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Topology from './pages/Topology'
import Simulations from './pages/Simulations'
import Configurations from './pages/Configurations'
import Monitoring from './pages/Monitoring'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/topology" element={<Topology />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/configurations" element={<Configurations />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  )
}

export default App
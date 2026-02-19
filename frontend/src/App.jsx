import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import DashboardSidebar from './components/DashboardSidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import History from './pages/History'
import Results from './pages/Results'
import { initializeCSRF } from './api/client'
import './styles/app.css'

function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ height: '100%' }}
          >
            <Routes location={location}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/history" element={<History />} />
              <Route path="/results/:id" element={<Results />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isDashboardRoute = ['/dashboard', '/analyze', '/history'].includes(location.pathname) || location.pathname.startsWith('/results/')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (isDashboardRoute) {
    return <DashboardLayout />
  }

  return (
    <>
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  )
}

function App() {
  useEffect(() => {
    initializeCSRF()
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-[#07281b] min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <AppContent />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

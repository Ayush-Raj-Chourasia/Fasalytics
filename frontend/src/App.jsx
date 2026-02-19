import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import History from './pages/History'
import Results from './pages/Results'
import { initializeCSRF } from './api/client'
import './styles/app.css'

function AppContent() {
  const location = useLocation()
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/results/:id" element={<Results />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  useEffect(() => {
    // Initialize CSRF token when app loads
    initializeCSRF()
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-[#0F1724] min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 w-full">
          <AppContent />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App

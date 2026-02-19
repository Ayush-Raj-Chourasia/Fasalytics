import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

const pageTransition = { duration: 0.25, ease: 'easeOut' }

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}

function HomeLayout() {
  return (
    <>
      <Navigation />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={pageTransition}
      >
        <Outlet />
      </motion.div>
      <Footer />
    </>
  )
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageTransition}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

function App() {
  useEffect(() => {
    initializeCSRF()
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="bg-[#07281b] min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <Routes>
            {/* Home route with nav/footer */}
            <Route element={<HomeLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Dashboard routes with sidebar */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/analyze" element={<PageWrapper><Analyze /></PageWrapper>} />
              <Route path="/history" element={<PageWrapper><History /></PageWrapper>} />
              <Route path="/results/:id" element={<PageWrapper><Results /></PageWrapper>} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

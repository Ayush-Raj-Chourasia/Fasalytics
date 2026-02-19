import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Features' },
    { path: '/analyze', label: 'Technology' },
    { path: '/history', label: 'Pricing' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0f1a]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-bold text-xl sm:text-2xl hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0fbf75] to-[#00D28A] flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="tracking-tight">Fasalytics</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <ul className="flex items-center gap-1 mr-6">
              {navItems.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      isActive(path)
                        ? 'text-[#00D28A]'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth Buttons */}
            <Link
              to="/history"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/analyze')}
              className="px-5 py-2 bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-[#0fbf75]/30 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 border-t border-white/10">
                <ul className="flex flex-col gap-1 mb-4">
                  {navItems.map(({ path, label }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          isActive(path)
                            ? 'text-[#00D28A] bg-[#0fbf75]/10'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 px-4">
                  <Link
                    to="/history"
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors text-center"
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      navigate('/analyze')
                    }}
                    className="py-2.5 bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white text-sm font-semibold rounded-full"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navigation

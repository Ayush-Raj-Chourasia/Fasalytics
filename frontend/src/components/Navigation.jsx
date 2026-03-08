import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'

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
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyze', label: 'Analyze' },
    { path: '/history', label: 'History' },
  ]

  return (
    <nav className={`nav-fixed ${(scrolled || isOpen) ? 'nav-solid' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Leaf size={18} color="white" />
          </div>
          <span>Fasalytics</span>
        </Link>

        <button
          className="nav-hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className="nav-links">
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <Link to={path} className={`nav-link ${isActive(path) ? 'active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          <Link to="/dashboard" className="nav-login">Login</Link>
          <button onClick={() => navigate('/analyze')} className="nav-cta">
            Get Started
          </button>
        </div>
      </div>

      <div className={`nav-mobile ${isOpen ? 'open' : ''}`}>
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setIsOpen(false)}
            className={`nav-link ${isActive(path) ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <div style={{ padding: '16px' }}>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="nav-login" style={{ display: 'block', textAlign: 'center', marginBottom: '12px' }}>
            Login
          </Link>
          <button onClick={() => { setIsOpen(false); navigate('/analyze'); }} className="nav-cta" style={{ width: '100%' }}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

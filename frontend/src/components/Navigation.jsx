import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'
import '../styles/navigation.css'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Leaf className="logo-icon" />
          <span>Fasalytics</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link 
              to="/" 
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/analyze" 
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Analyze
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/history" 
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              History
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation

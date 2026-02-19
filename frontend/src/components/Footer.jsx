import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Github, Linkedin, Twitter } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Brand */}
        <div>
          <div className="nav-logo" style={{ marginBottom: '0' }}>
            <div className="nav-logo-icon">
              <Leaf size={16} color="white" />
            </div>
            <span>Fasalytics</span>
          </div>
          <p className="footer-brand-desc">
            Empowering farmers with artificial intelligence to secure the future of agriculture.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="GitHub"><Github size={16} /></a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a href="#" className="footer-social-link" aria-label="Twitter"><Twitter size={16} /></a>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="footer-section-title">Product</h4>
          <Link to="/dashboard" className="footer-link">Features</Link>
          <Link to="/history" className="footer-link">Pricing</Link>
          <a href="#" className="footer-link">API</a>
          <a href="#" className="footer-link">Case Studies</a>
        </div>

        {/* Company */}
        <div>
          <h4 className="footer-section-title">Company</h4>
          <a href="#" className="footer-link">About Us</a>
          <a href="#" className="footer-link">Careers</a>
          <a href="#" className="footer-link">Blog</a>
          <a href="#" className="footer-link">Contact</a>
        </div>

        {/* Subscribe */}
        <div>
          <h4 className="footer-section-title">Subscribe</h4>
          <p className="footer-subscribe-desc">
            Join our newsletter for the latest updates and insights.
          </p>
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="footer-subscribe-input"
            />
            <button type="submit" className="footer-subscribe-btn">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {currentYear} Fasalytics Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link">Privacy Policy</a>
            <a href="#" className="footer-bottom-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

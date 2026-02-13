import React from 'react'
import { Leaf, Mail, Phone } from 'lucide-react'
import '../styles/footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <Leaf size={32} />
            <h3>Fasalytics</h3>
          </div>
          <p>AI-powered crop health monitoring platform</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/analyze">Analyze</a></li>
            <li><a href="/history">History</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={18} />
              <span>info@fasalytics.com</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Fasalytics. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

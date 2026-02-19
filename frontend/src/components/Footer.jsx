import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Github, Linkedin, Twitter } from 'lucide-react'
import { motion } from 'framer-motion'

function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')

  const productLinks = [
    { label: 'Features', href: '/dashboard' },
    { label: 'Pricing', href: '/history' },
    { label: 'API', href: '#' },
    { label: 'Case Studies', href: '#' },
  ]

  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ]

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ]

  const handleSubscribe = (e) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="bg-[#080c14] border-t border-white/5">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0fbf75] to-[#00D28A] flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Fasalytics</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Empowering farmers with artificial intelligence to secure the future of agriculture.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#00D28A] hover:border-[#0fbf75]/30 transition-all"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-gray-500 hover:text-[#00D28A] transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-500 hover:text-[#00D28A] transition-colors text-sm"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Subscribe Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Subscribe
            </h4>
            <p className="text-gray-500 text-sm mb-4">
              Join our newsletter for the latest updates and insights.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0fbf75]/50 focus:ring-1 focus:ring-[#0fbf75]/30 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[#0fbf75]/20 transition-all"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>&copy; {currentYear} Fasalytics Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#00D28A] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#00D28A] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, Droplets, Brain, TrendingUp,
  Smartphone, Leaf, Upload, BarChart3, FileText
} from 'lucide-react'

function Home() {
  const navigate = useNavigate()

  const features = [
    { icon: Activity, title: 'Real-time Monitoring', description: 'Continuous surveillance of crop conditions using satellite imagery & drone feeds' },
    { icon: Smartphone, title: 'Precision Irrigation', description: 'AI-driven water scheduling to optimize usage and ensure perfect soil moisture levels' },
    { icon: Brain, title: 'Pest Detection', description: 'Early warning systems that identify pest infestations before they spread across fields' },
    { icon: TrendingUp, title: 'Yield Forecasting', description: 'Predictive models that estimate harvest quantities with up to 88% accuracy' },
    { icon: Droplets, title: 'Climate Analysis', description: 'Hyper-local weather predictions integrated directly into your daily farming planning' },
    { icon: Leaf, title: 'Soil Health AI', description: 'Deep analysis of soil nutrient composition to recommend precise fertilizer applications' }
  ]

  const workflow = [
    { step: 'STEP 01', title: 'Upload', description: 'Capture or Upload Crop Images directly from your smartphone.', icon: Upload },
    { step: 'STEP 02', title: 'Analyze', description: 'Our AI engine processes the data to diagnose health & diseases.', icon: BarChart3 },
    { step: 'STEP 03', title: 'Act', description: 'Receive actionable treatment plans and fertilizer recommendations.', icon: FileText }
  ]

  return (
    <div style={{ width: '100%', background: '#0F1724', overflow: 'hidden' }}>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-inner">
          {/* Left — Text */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.9, 0.13, 1] }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="hero-badge-dot" />
              <span className="hero-badge-text">New: AI Soil Screening 2.3</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              AI-Powered Crop Health at{' '}
              <span className="hero-title-green">Your Fingertips</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Maximize yield and minimize waste with real-time analytics driven by advanced machine learning. Precision farming for the modern age.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <button className="hero-btn-primary" onClick={() => navigate('/analyze')}>
                Start Analyzing →
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate('/dashboard')}>
                <span>▶</span> View Dashboard
              </button>
            </motion.div>
          </motion.div>

          {/* Right — Image + Floating Stats */}
          <motion.div
            style={{ position: 'relative' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.9, 0.13, 1] }}
          >
            <div className="hero-image-wrapper">
              <img
                src="/images/hero-crop.png"
                alt="Crop health monitoring"
                className="hero-image"
              />
              <div className="hero-image-gradient" />
            </div>

            <div className="hero-stats-card">
              <div className="hero-stats-inner">
                <div>
                  <p className="hero-stat-label">SOIL MOISTURE</p>
                  <p className="hero-stat-value green">65%</p>
                  <p className="hero-stat-sub">Optimal</p>
                </div>
                <div className="hero-stat-divider" />
                <div>
                  <p className="hero-stat-label">HEALTH</p>
                  <p className="hero-stat-value light-green">High</p>
                  <p className="hero-stat-sub">↑ 2.4%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          {[
            { value: '500+', label: 'FARMERS TRUSTED' },
            { value: '98%', label: 'AI ACCURACY' },
            { value: '1M+', label: 'ACRES ANALYZED' },
            { value: '24/7', label: 'MONITORING' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="stat-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features">
        <div className="features-inner">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Cultivate Intelligence</h2>
            <p className="section-subtitle">
              Our comprehensive suite of tools leverages cutting-edge technology to give you complete control over your farm's ecosystem
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  className="feature-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="feature-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section className="workflow">
        <div className="workflow-inner">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">From Field to Data in 3 Steps</h2>
            <p className="section-subtitle">Our streamlined workflow gets you actionable insights in minutes</p>
          </motion.div>

          <div className="workflow-steps">
            <div className="workflow-line" />
            {workflow.map((w, idx) => {
              const Icon = w.icon
              return (
                <motion.div
                  key={idx}
                  className="workflow-step"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="workflow-circle-outer">
                    <div className="workflow-circle-inner">
                      <Icon size={28} />
                    </div>
                  </div>
                  <p className="workflow-step-label">{w.step}</p>
                  <h3 className="workflow-step-title">{w.title}</h3>
                  <p className="workflow-step-desc">{w.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-glow-1" />
        <div className="cta-glow-2" />
        <div className="cta-inner">
          <motion.h2
            className="cta-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to transform your farm?
          </motion.h2>

          <motion.p
            className="cta-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join farmers worldwide already using Fasalytics for precision agriculture.
          </motion.p>

          <motion.button
            className="cta-btn"
            onClick={() => navigate('/analyze')}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get Started Free
          </motion.button>

          <motion.p
            className="cta-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            No credit card required for 14-day trial
          </motion.p>
        </div>
      </section>
    </div>
  )
}

export default Home

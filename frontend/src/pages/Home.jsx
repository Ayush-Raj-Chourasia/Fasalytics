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
    { icon: Activity, title: 'Dual-Mode Analysis', description: 'Analyse crop health via live IoT sensor readings or by uploading crop images — both processed by our AI engine' },
    { icon: Brain, title: 'CNN Disease Detection', description: 'Convolutional Neural Network model detects diseases and classifies crop health from images with up to 88% accuracy' },
    { icon: Droplets, title: 'Sensor Data Insights', description: 'Feed soil moisture, temperature, humidity, leaf wetness, and pH data for instant health scoring' },
    { icon: TrendingUp, title: 'Actionable Recommendations', description: 'Get prioritised treatment plans, irrigation schedules, and fertiliser guidance based on your specific crop and readings' },
    { icon: Smartphone, title: 'Analysis History', description: 'Track every analysis across all your farms with timestamped records you can revisit and compare over time' },
    { icon: Leaf, title: 'PDF Health Reports', description: 'Export a professionally formatted PDF report for any analysis — sensor readings, AI predictions, and recommendations included' }
  ]

  const workflow = [
    { step: 'STEP 01', title: 'Upload', description: 'Capture or Upload Crop Images directly from your smartphone.', icon: Upload },
    { step: 'STEP 02', title: 'Analyze', description: 'Our AI engine processes the data to diagnose health & diseases.', icon: BarChart3 },
    { step: 'STEP 03', title: 'Act', description: 'Receive actionable treatment plans and fertilizer recommendations.', icon: FileText }
  ]

  return (
    <div style={{ width: '100%', background: '#07281b', overflow: 'hidden' }}>
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
              <span className="hero-badge-text">CNN + IoT Sensor Powered Crop Analysis</span>
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
              Upload a crop image or enter IoT sensor readings — Fasalytics detects diseases, scores plant health, and delivers prioritised treatment recommendations in seconds.
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
            { value: '5', label: 'SENSOR METRICS TRACKED' },
            { value: '88%', label: 'CNN MODEL ACCURACY' },
            { value: '2', label: 'ANALYSIS MODES' },
            { value: '24/7', label: 'FREE TO USE' }
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
          <h2 className="section-title">What Fasalytics Can Do</h2>
            <p className="section-subtitle">
              An end-to-end crop intelligence platform built by Team Inquisitor — combining computer vision with IoT sensor analytics to give farmers actionable insights
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
          <h2 className="section-title">From Field to Report in 3 Steps</h2>
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
            Ready to Analyse Your Crop?
          </motion.h2>

          <motion.p
            className="cta-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Try Fasalytics free — upload a crop image or enter sensor data and get an AI health report within seconds.
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
            No account needed · Built by Team Inquisitor
          </motion.p>
        </div>
      </section>
    </div>
  )
}

export default Home

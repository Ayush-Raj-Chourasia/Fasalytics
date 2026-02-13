import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Leaf, 
  Zap, 
  TrendingUp, 
  Shield,
  ChevronRight,
  Activity,
  Droplets,
  Thermometer
} from 'lucide-react'
import '../styles/home.css'

function Home() {
  const features = [
    {
      icon: <Activity size={32} />,
      title: 'Real-time Monitoring',
      description: 'Monitor crop health with real-time sensor data and AI analysis'
    },
    {
      icon: <Droplets size={32} />,
      title: 'Soil Analysis',
      description: 'Comprehensive soil moisture, pH, and nutrient analysis'
    },
    {
      icon: <Thermometer size={32} />,
      title: 'Climate Tracking',
      description: 'Track temperature, humidity, and leaf wetness conditions'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Predictive Analytics',
      description: 'Get early warnings for crop stress and disease risks'
    },
    {
      icon: <Shield size={32} />,
      title: 'Expert Recommendations',
      description: 'Receive actionable recommendations to improve crop health'
    },
    {
      icon: <Zap size={32} />,
      title: 'Fast Processing',
      description: 'AI-powered analysis with confidence scores and zone mapping'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>AI-Powered Crop Health Monitoring</h1>
            <p>Protect your harvest with advanced AI technology and real-time sensor analytics</p>
            <div className="hero-buttons">
              <Link to="/analyze" className="btn btn-primary">
                Start Analyzing
                <ChevronRight size={20} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                View Dashboard
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-icon">
              <Leaf size={120} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Powerful Features for Modern Farming</h2>
          <p>Everything you need to maximize crop yield and minimize risks</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How Fasalytics Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Input Data</h3>
            <p>Provide sensor readings or upload field images</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our ML models process and analyze the data</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive detailed health status and recommendations</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Monitor Your Crops?</h2>
          <p>Start analyzing your crop health today with Fasalytics AI</p>
          <Link to="/analyze" className="btn btn-large">
            Begin Analysis
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

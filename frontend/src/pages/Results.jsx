import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  CheckCircle2, AlertCircle, TrendingUp, 
  Download, ArrowLeft, Share2 
} from 'lucide-react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/results.css'

function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [id])

  const fetchResults = async () => {
    try {
      const response = await api.getResults(id)
      setResult(response.data)
    } catch (err) {
      setError('Failed to load analysis results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const mockResult = result || {
    id: id,
    prediction_status: 'healthy',
    confidence: 94.2,
    crop_type: 'Wheat',
    field_name: 'Field A',
    recommendation: 'Continue current irrigation schedule. Soil moisture levels are optimal.',
    stress_reason: 'N/A',
    timestamp: new Date().toISOString(),
    soil_moisture: 55,
    temperature: 22.5,
    humidity: 72,
    ph_level: 6.8,
    zone_map: [
      { zone: 'North', status: 'healthy' },
      { zone: 'South', status: 'healthy' },
      { zone: 'East', status: 'healthy' },
      { zone: 'West', status: 'healthy' }
    ]
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const response = await api.exportPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analysis_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="results">
      <button 
        className="btn-back"
        onClick={() => navigate('/history')}
      >
        <ArrowLeft size={20} />
        Back to History
      </button>

      <div className="results-header">
        <div className={`status-indicator ${mockResult.prediction_status}`}>
          {mockResult.prediction_status === 'healthy' ? (
            <CheckCircle2 size={48} />
          ) : (
            <AlertCircle size={48} />
          )}
        </div>
        <h1>{mockResult.crop_type || 'Crop'} Analysis Results</h1>
        <p className="field-info">{mockResult.field_name} • {new Date(mockResult.timestamp).toLocaleDateString()}</p>
      </div>

      {/* Main Status Card */}
      <div className={`status-card ${mockResult.prediction_status}`}>
        <div className="status-content">
          <h2>
            {mockResult.prediction_status === 'healthy' ? 'Crop is Healthy' : 'Crop Showing Stress'}
          </h2>
          <p className="confidence">
            <TrendingUp size={20} />
            Confidence: {mockResult.confidence.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleExportPDF}
          disabled={exporting}
        >
          <Download size={20} />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
        <button className="btn btn-secondary">
          <Share2 size={20} />
          Share Results
        </button>
      </div>

      {/* Recommendations */}
      <div className="results-section">
        <h3>📋 Recommendations</h3>
        <p>{mockResult.recommendation}</p>
      </div>

      {/* Sensor Data */}
      <div className="results-grid">
        <div className="results-section">
          <h3>🌡️ Environmental Conditions</h3>
          <div className="data-grid">
            <div className="data-point">
              <label>Temperature</label>
              <span>{mockResult.temperature}°C</span>
            </div>
            <div className="data-point">
              <label>Humidity</label>
              <span>{mockResult.humidity}%</span>
            </div>
            <div className="data-point">
              <label>Soil Moisture</label>
              <span>{mockResult.soil_moisture}%</span>
            </div>
            <div className="data-point">
              <label>pH Level</label>
              <span>{mockResult.ph_level}</span>
            </div>
          </div>
        </div>

        {/* Zone Map */}
        {mockResult.zone_map && mockResult.zone_map.length > 0 && (
          <div className="results-section">
            <h3>📍 Field Zone Status</h3>
            <div className="zone-grid">
              {mockResult.zone_map.map((zone, index) => (
                <div key={index} className={`zone-card ${zone.status}`}>
                  <h4>{zone.zone}</h4>
                  <p>{zone.status === 'healthy' ? '✓ Healthy' : '⚠ Stressed'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stress Information */}
      {mockResult.prediction_status === 'stressed' && (
        <div className="results-section stress-info">
          <h3>⚠️ Stress Analysis</h3>
          <p>{mockResult.stress_reason}</p>
        </div>
      )}

      {/* Next Steps */}
      <div className="next-steps">
        <h3>Next Steps</h3>
        <ul>
          <li>Monitor crop regularly using the dashboard</li>
          <li>Track changes in sensor readings</li>
          <li>Follow recommendations to maintain crop health</li>
          <li>Export this report for records</li>
        </ul>
      </div>
    </div>
  )
}

export default Results

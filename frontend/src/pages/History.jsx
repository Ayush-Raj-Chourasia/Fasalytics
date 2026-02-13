import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Calendar, TrendingUp } from 'lucide-react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/history.css'

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.getHistory()
      setAnalyses(response.data || [])
    } catch (err) {
      setError('Failed to load analysis history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const mockAnalyses = analyses.length > 0 ? analyses : [
    {
      id: 1,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      prediction_status: 'healthy',
      confidence: 94.2,
      crop_type: 'Wheat',
      field_name: 'Field A'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      prediction_status: 'stressed',
      confidence: 87.5,
      crop_type: 'Corn',
      field_name: 'Field B'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      prediction_status: 'healthy',
      confidence: 91.3,
      crop_type: 'Soybean',
      field_name: 'Field C'
    }
  ]

  const sortedAnalyses = [...mockAnalyses].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp) - new Date(a.timestamp)
    } else if (sortBy === 'confidence') {
      return b.confidence - a.confidence
    }
    return 0
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="history">
      <div className="history-header">
        <h1>Analysis History</h1>
        <p>Review all your crop health analyses</p>
      </div>

      <div className="history-controls">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="recent">Most Recent</option>
          <option value="confidence">Highest Confidence</option>
        </select>
      </div>

      {sortedAnalyses.length === 0 ? (
        <div className="empty-state">
          <TrendingUp size={48} />
          <h2>No analyses yet</h2>
          <p>Start analyzing your crops to see history here</p>
          <Link to="/analyze" className="btn btn-primary">
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="analyses-list">
          {sortedAnalyses.map((analysis) => (
            <Link 
              key={analysis.id} 
              to={`/results/${analysis.id}`}
              className="analysis-card"
            >
              <div className="analysis-status">
                {analysis.prediction_status === 'healthy' ? (
                  <div className="status-badge healthy">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="status-badge stressed">
                    <AlertCircle size={24} />
                  </div>
                )}
              </div>

              <div className="analysis-details">
                <div className="analysis-main">
                  <h3>{analysis.crop_type || 'Unknown Crop'}</h3>
                  <p className="field-name">{analysis.field_name || 'Field Analysis'}</p>
                </div>

                <div className="analysis-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(analysis.timestamp)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="confidence-badge">
                      {analysis.confidence.toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="analysis-status-text">
                {analysis.prediction_status === 'healthy' ? 'Healthy' : 'Stressed'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default History

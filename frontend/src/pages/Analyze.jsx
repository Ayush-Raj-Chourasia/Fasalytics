import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Zap, AlertCircle } from 'lucide-react'
import { api } from '../api/client'
import '../styles/analyze.css'

function Analyze() {
  const navigate = useNavigate()
  const [analyzeMethod, setAnalyzeMethod] = useState('sensor') // 'sensor' or 'image'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [sensorData, setSensorData] = useState({
    soil_moisture: '',
    temperature: '',
    humidity: '',
    leaf_wetness: '',
    ph_level: ''
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleSensorChange = (e) => {
    const { name, value } = e.target
    setSensorData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const validateSensorData = () => {
    const values = Object.values(sensorData)
    if (values.some(v => v === '')) {
      setError('All sensor fields are required')
      return false
    }

    const soil_moisture = parseFloat(sensorData.soil_moisture)
    const temperature = parseFloat(sensorData.temperature)
    const humidity = parseFloat(sensorData.humidity)
    const ph_level = parseFloat(sensorData.ph_level)

    if (soil_moisture < 0 || soil_moisture > 100) {
      setError('Soil moisture should be between 0-100%')
      return false
    }
    if (temperature < -50 || temperature > 50) {
      setError('Temperature should be between -50°C to 50°C')
      return false
    }
    if (humidity < 0 || humidity > 100) {
      setError('Humidity should be between 0-100%')
      return false
    }
    if (ph_level < 0 || ph_level > 14) {
      setError('pH level should be between 0-14')
      return false
    }

    return true
  }

  const handleSensorSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateSensorData()) return

    setLoading(true)
    try {
      const response = await api.analyzeFromSensorData({
        soil_moisture: parseFloat(sensorData.soil_moisture),
        temperature: parseFloat(sensorData.temperature),
        humidity: parseFloat(sensorData.humidity),
        leaf_wetness: parseFloat(sensorData.leaf_wetness),
        ph_level: parseFloat(sensorData.ph_level)
      })

      setSuccess('Analysis submitted successfully!')
      setTimeout(() => {
        navigate(`/results/${response.data.id}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze crop data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSubmit = async (e) => {
    e.preventDefault()

    if (!imageFile) {
      setError('Please select an image to analyze')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('crop_image', imageFile)

    try {
      const response = await api.analyzeFromImage(formData)
      setSuccess('Image analysis submitted successfully!')
      setTimeout(() => {
        navigate(`/results/${response.data.id}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze image')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyze">
      <div className="analyze-header">
        <h1>Crop Health Analysis</h1>
        <p>Analyze your crops using sensor data or field images</p>
      </div>

      <div className="analyze-container">
        {/* Method Selection */}
        <div className="method-selector">
          <button
            className={`method-btn ${analyzeMethod === 'sensor' ? 'active' : ''}`}
            onClick={() => setAnalyzeMethod('sensor')}
          >
            <Zap size={24} />
            Sensor Data
          </button>
          <button
            className={`method-btn ${analyzeMethod === 'image' ? 'active' : ''}`}
            onClick={() => setAnalyzeMethod('image')}
          >
            <Upload size={24} />
            Field Image
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Sensor Data Form */}
        {analyzeMethod === 'sensor' && (
          <form className="analyze-form" onSubmit={handleSensorSubmit}>
            <h2>Enter Sensor Readings</h2>
            
            <div className="form-group">
              <label>Soil Moisture (%)</label>
              <input
                type="number"
                name="soil_moisture"
                min="0"
                max="100"
                step="0.1"
                value={sensorData.soil_moisture}
                onChange={handleSensorChange}
                placeholder="0-100"
                disabled={loading}
              />
              <span className="form-hint">0-100% (Optimal: 40-60%)</span>
            </div>

            <div className="form-group">
              <label>Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                min="-50"
                max="50"
                step="0.1"
                value={sensorData.temperature}
                onChange={handleSensorChange}
                placeholder="-50 to 50"
                disabled={loading}
              />
              <span className="form-hint">-50°C to 50°C (Optimal: 20-25°C)</span>
            </div>

            <div className="form-group">
              <label>Humidity (%)</label>
              <input
                type="number"
                name="humidity"
                min="0"
                max="100"
                step="0.1"
                value={sensorData.humidity}
                onChange={handleSensorChange}
                placeholder="0-100"
                disabled={loading}
              />
              <span className="form-hint">0-100% (Optimal: 60-80%)</span>
            </div>

            <div className="form-group">
              <label>Leaf Wetness (%)</label>
              <input
                type="number"
                name="leaf_wetness"
                min="0"
                max="100"
                step="0.1"
                value={sensorData.leaf_wetness}
                onChange={handleSensorChange}
                placeholder="0-100"
                disabled={loading}
              />
              <span className="form-hint">0-100% (Indicates disease risk)</span>
            </div>

            <div className="form-group">
              <label>pH Level</label>
              <input
                type="number"
                name="ph_level"
                min="0"
                max="14"
                step="0.1"
                value={sensorData.ph_level}
                onChange={handleSensorChange}
                placeholder="0-14"
                disabled={loading}
              />
              <span className="form-hint">0-14 (Optimal: 6-7)</span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Crop Health'}
            </button>
          </form>
        )}

        {/* Image Upload Form */}
        {analyzeMethod === 'image' && (
          <form className="analyze-form" onSubmit={handleImageSubmit}>
            <h2>Upload Field Image</h2>
            
            <div className="image-upload-area">
              <input
                type="file"
                id="image-input"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-input" className="upload-label">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" />
                    <span>Click to change</span>
                  </div>
                ) : (
                  <>
                    <Upload size={48} />
                    <span>Click or drag image here</span>
                    <small>Supported: JPG, PNG, WebP</small>
                  </>
                )}
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading || !imageFile}
            >
              {loading ? 'Analyzing Image...' : 'Analyze Image'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Analyze

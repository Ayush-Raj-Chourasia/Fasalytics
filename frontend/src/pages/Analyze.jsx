import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api/client'

function Analyze() {
  const navigate = useNavigate()
  const [analyzeMethod, setAnalyzeMethod] = useState('sensor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

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
    setSensorData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }))
    }
    setError(null)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
      setError(null)
      setValidationErrors({})
    }
  }

  const validateSensorData = () => {
    const newErrors = {}
    const values = sensorData

    if (values.soil_moisture === '') newErrors.soil_moisture = 'Required'
    else { const val = parseFloat(values.soil_moisture); if (val < 0 || val > 100) newErrors.soil_moisture = 'Must be 0-100%' }

    if (values.temperature === '') newErrors.temperature = 'Required'
    else { const val = parseFloat(values.temperature); if (val < -50 || val > 50) newErrors.temperature = 'Must be -50 to 50°C' }

    if (values.humidity === '') newErrors.humidity = 'Required'
    else { const val = parseFloat(values.humidity); if (val < 0 || val > 100) newErrors.humidity = 'Must be 0-100%' }

    if (values.ph_level === '') newErrors.ph_level = 'Required'
    else { const val = parseFloat(values.ph_level); if (val < 0 || val > 14) newErrors.ph_level = 'Must be 0-14' }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      setTimeout(() => navigate(`/results/${response.data.id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze crop data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSubmit = async (e) => {
    e.preventDefault()
    if (!imageFile) { setError('Please select an image to analyze'); return }

    setLoading(true)
    const formData = new FormData()
    formData.append('crop_image', imageFile)

    try {
      const response = await api.analyzeFromImage(formData)
      setSuccess('Image analysis submitted successfully!')
      setTimeout(() => navigate(`/results/${response.data.id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  const liveResults = sensorData.soil_moisture && sensorData.temperature && sensorData.humidity
    ? { health_status: 'Healthy', confidence: 87.5, recommendations: ['Maintain current watering schedule', 'Monitor humidity levels closely', 'Apply preventative fungicide'] }
    : null

  const sensorFields = [
    { name: 'soil_moisture', label: 'Soil Moisture', unit: '%', icon: 'water_drop', min: 0, max: 100, optimal: '40-60%', step: 0.1, color: '#3b82f6' },
    { name: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermostat', min: -50, max: 50, optimal: '20-25°C', step: 0.1, color: '#f59e0b' },
    { name: 'humidity', label: 'Humidity', unit: '%', icon: 'humidity_mid', min: 0, max: 100, optimal: '60-80%', step: 0.1, color: '#06b6d4' },
    { name: 'leaf_wetness', label: 'Leaf Wetness', unit: '%', icon: 'eco', min: 0, max: 100, optimal: 'Low', step: 0.1, color: '#0fbd74' },
    { name: 'ph_level', label: 'pH Level', unit: '', icon: 'science', min: 0, max: 14, optimal: '6.0-7.0', step: 0.1, color: '#8b5cf6' },
  ]

  const getProgress = (name) => {
    const v = parseFloat(sensorData[name])
    if (isNaN(v)) return 0
    const field = sensorFields.find(f => f.name === name)
    return Math.min(100, Math.max(0, ((v - field.min) / (field.max - field.min)) * 100))
  }

  return (
    <div className="min-h-screen bg-[#10221a]">
      {/* Top Bar */}
      <header className="bg-[#10221a]/80 backdrop-blur-md border-b border-[#0fbd74]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#8faeb0] mb-1">
              <button onClick={() => navigate('/dashboard')} className="hover:text-[#0fbd74] transition-colors">Dashboard</button>
              <span className="material-icons-round text-xs">chevron_right</span>
              <span className="text-white">Analysis Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Analysis Hub</h1>
          </div>
          <button
            onClick={(e) => analyzeMethod === 'sensor' ? handleSensorSubmit(e) : handleImageSubmit(e)}
            disabled={loading}
            className="bg-[#0fbd74] hover:bg-[#0ca665] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-[#0fbd74]/20 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-sm">play_arrow</span>
            {loading ? 'Analyzing...' : 'Start New Analysis'}
          </button>
        </div>
      </header>

      {/* Alerts */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-7xl mx-auto px-6 pt-4">
            <div className={`p-4 rounded-xl flex items-start gap-3 ${error ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#0fbd74]/10 border border-[#0fbd74]/20'}`}>
              <span className={`material-icons-round text-lg ${error ? 'text-red-400' : 'text-[#0fbd74]'}`}>{error ? 'error_outline' : 'check_circle'}</span>
              <p className={`text-sm ${error ? 'text-red-300' : 'text-[#0fbd74]'}`}>{error || success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setAnalyzeMethod('sensor'); setValidationErrors({}); setError(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${analyzeMethod === 'sensor' ? 'bg-[#0fbd74]/10 text-[#0fbd74] border border-[#0fbd74]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-icons-round text-lg">sensors</span> Sensor Data
          </button>
          <button
            onClick={() => { setAnalyzeMethod('image'); setValidationErrors({}); setError(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${analyzeMethod === 'image' ? 'bg-[#0fbd74]/10 text-[#0fbd74] border border-[#0fbd74]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-icons-round text-lg">image</span> Field Image
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-8 space-y-6">
            {analyzeMethod === 'sensor' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#0fbd74]/20 rounded-lg">
                    <span className="material-icons-round text-[#0fbd74]">sensors</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Sensor Input Panel</h2>
                    <p className="text-sm text-[#8faeb0]">Enter real-time sensor readings below</p>
                  </div>
                </div>

                <form onSubmit={handleSensorSubmit} className="space-y-5">
                  {sensorFields.map((field, i) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-icons-round text-lg" style={{ color: field.color }}>{field.icon}</span>
                          <label className="text-sm font-medium text-gray-300">{field.label}</label>
                        </div>
                        <span className="text-xs text-[#8faeb0]">Optimal: {field.optimal}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            name={field.name}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={sensorData[field.name]}
                            onChange={handleSensorChange}
                            placeholder={`${field.min}${field.unit} – ${field.max}${field.unit}`}
                            disabled={loading}
                            className={`w-full px-4 py-3 rounded-lg border bg-[#0c1b14] text-white placeholder-gray-600 transition-all focus:ring-2 focus:outline-none disabled:opacity-50 ${
                              validationErrors[field.name] ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-[#0fbd74]/50 focus:ring-[#0fbd74]/20'
                            }`}
                          />
                          {field.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8faeb0]">{field.unit}</span>}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: field.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress(field.name)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      {validationErrors[field.name] && (
                        <p className="text-xs text-red-400 mt-1">{validationErrors[field.name]}</p>
                      )}
                    </motion.div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-[#0fbd74] hover:bg-[#0ca665] disabled:opacity-50 text-white py-3 rounded-lg font-semibold shadow-lg shadow-[#0fbd74]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Analysis...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-lg">biotech</span>
                        Run Crop Analysis
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <span className="material-icons-round text-blue-400">image</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Image Upload</h2>
                    <p className="text-sm text-[#8faeb0]">Upload a field image for AI analysis</p>
                  </div>
                </div>

                <form onSubmit={handleImageSubmit}>
                  <input type="file" id="image-input" accept="image/*" onChange={handleImageSelect} disabled={loading} className="hidden" />
                  <label
                    htmlFor="image-input"
                    className="block border-2 border-dashed border-white/10 rounded-xl hover:border-[#0fbd74]/30 transition-all cursor-pointer group"
                  >
                    {imagePreview ? (
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 text-center">
                        <img src={imagePreview} alt="Preview" className="max-h-72 mx-auto rounded-xl mb-3" />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </motion.div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#0fbd74]/10 flex items-center justify-center mb-4 group-hover:bg-[#0fbd74]/20 transition-colors">
                          <span className="material-icons-round text-3xl text-[#0fbd74]">cloud_upload</span>
                        </div>
                        <p className="text-white font-semibold mb-1">Drop your field image here</p>
                        <p className="text-sm text-[#8faeb0]">or click to browse • JPG, PNG, WebP</p>
                      </div>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !imageFile}
                    className="w-full mt-6 bg-[#0fbd74] hover:bg-[#0ca665] disabled:opacity-50 text-white py-3 rounded-lg font-semibold shadow-lg shadow-[#0fbd74]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-lg">auto_awesome</span>
                        Analyze Image
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Bottom info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'schedule', title: 'Last Reading', value: '2 min ago', desc: 'Auto-sync active', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                { icon: 'trending_up', title: 'Trend', value: '+2.4%', desc: 'Improving vs last week', color: 'text-[#0fbd74]', bg: 'bg-[#0fbd74]/20' },
                { icon: 'psychology', title: 'AI Model', value: 'v3.2', desc: '96.4% accuracy', color: 'text-purple-400', bg: 'bg-purple-500/20' },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-lg ${card.bg}`}>
                      <span className={`material-icons-round text-lg ${card.color}`}>{card.icon}</span>
                    </div>
                    <span className="text-xs text-[#8faeb0] font-medium">{card.title}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-[#8faeb0] mt-0.5">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Live Results */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-xl p-6 lg:sticky lg:top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Live Results</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${liveResults ? 'bg-[#0fbd74] animate-pulse' : 'bg-gray-600'}`} />
                  <span className="text-xs text-[#8faeb0]">{liveResults ? 'Active' : 'Waiting'}</span>
                </div>
              </div>

              {liveResults ? (
                <>
                  {/* Confidence Ring */}
                  <div className="text-center mb-6">
                    <div className="relative w-36 h-36 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#1c3b2f" strokeWidth="8" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#0fbd74" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${liveResults.confidence * 3.267} 326.7`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{liveResults.confidence}%</span>
                        <span className="text-xs text-[#8faeb0]">Confidence</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      liveResults.health_status === 'Healthy'
                        ? 'bg-[#0fbd74]/10 text-[#0fbd74] border border-[#0fbd74]/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      <span className="material-icons-round text-sm">{liveResults.health_status === 'Healthy' ? 'check_circle' : 'warning'}</span>
                      {liveResults.health_status}
                    </span>
                  </div>

                  {/* AI Recommendations */}
                  <div className="border-t border-white/5 pt-5">
                    <h4 className="text-xs font-semibold text-[#8faeb0] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-icons-round text-sm text-[#0fbd74]">auto_awesome</span>
                      AI Recommendations
                    </h4>
                    <div className="space-y-3">
                      {liveResults.recommendations.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[#0c1b14] border border-white/5"
                        >
                          <span className="text-xs font-bold text-[#0fbd74] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <p className="text-sm text-gray-300">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#1c3b2f] flex items-center justify-center mb-4">
                    <span className="material-icons-round text-3xl text-[#8faeb0]">pending</span>
                  </div>
                  <p className="text-[#8faeb0] text-sm mb-1">Awaiting sensor data</p>
                  <p className="text-xs text-gray-600">Fill in soil moisture, temperature, and humidity to see live results</p>
                </div>
              )}
            </motion.div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-5 bg-gradient-to-br from-[#0fbd74]/20 to-emerald-900/20 border border-[#0fbd74]/20"
            >
              <span className="material-icons-round text-[#0fbd74] text-2xl mb-3 block">rocket_launch</span>
              <h4 className="text-white font-bold mb-1">Pro Tip</h4>
              <p className="text-sm text-[#8faeb0] mb-3">Enable automated sensor syncing for real-time monitoring with instant alerts.</p>
              <button className="text-sm text-[#0fbd74] font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <span className="material-icons-round text-sm">arrow_forward</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analyze

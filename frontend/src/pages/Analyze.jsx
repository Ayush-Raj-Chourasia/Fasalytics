import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Zap, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, GradientButton, Reveal } from '../ui'

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
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
      setError(null)
      setValidationErrors({})
    }
  }

  const validateSensorData = () => {
    const newErrors = {}
    const values = sensorData

    if (values.soil_moisture === '') newErrors.soil_moisture = 'Required'
    else {
      const val = parseFloat(values.soil_moisture)
      if (val < 0 || val > 100) newErrors.soil_moisture = 'Must be 0-100%'
    }

    if (values.temperature === '') newErrors.temperature = 'Required'
    else {
      const val = parseFloat(values.temperature)
      if (val < -50 || val > 50) newErrors.temperature = 'Must be -50 to 50°C'
    }

    if (values.humidity === '') newErrors.humidity = 'Required'
    else {
      const val = parseFloat(values.humidity)
      if (val < 0 || val > 100) newErrors.humidity = 'Must be 0-100%'
    }

    if (values.ph_level === '') newErrors.ph_level = 'Required'
    else {
      const val = parseFloat(values.ph_level)
      if (val < 0 || val > 14) newErrors.ph_level = 'Must be 0-14'
    }

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
      setTimeout(() => navigate(`/results/${response.data.id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  const liveResults = sensorData.soil_moisture && sensorData.temperature && sensorData.humidity
    ? {
      health_status: 'Healthy',
      confidence: 87.5,
      recommendations: [
        'Maintain current watering schedule',
        'Monitor humidity levels',
        'Apply preventative fungicide'
      ]
    }
    : null

  const inputClassName = (fieldName) =>
    `w-full px-4 py-3 rounded-xl border transition-all bg-[#0a0f1a] text-white placeholder-gray-600 ${validationErrors[fieldName]
      ? 'border-red-500/50 focus:ring-red-500/30'
      : 'border-white/10 focus:border-[#0fbf75]/50 focus:ring-[#0fbf75]/20'
    } focus:ring-2 focus:outline-none disabled:opacity-50`

  return (
    <div className="min-h-screen bg-[#0F1724] pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Reveal>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Crop Health Analysis
            </h1>
            <p className="mt-3 text-base text-gray-400">
              Analyze your crops using sensor data or field images
            </p>
          </div>
        </Reveal>
      </div>

      {/* Method Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Reveal delay={0.1}>
          <div className="flex gap-3 max-w-md">
            <motion.button
              onClick={() => {
                setAnalyzeMethod('sensor')
                setValidationErrors({})
                setError(null)
              }}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${analyzeMethod === 'sensor'
                  ? 'bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white shadow-lg shadow-[#0fbf75]/20'
                  : 'bg-[#0a0f1a] text-gray-300 border border-white/10 hover:border-[#0fbf75]/30'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={18} />
              <span>Sensor Data</span>
            </motion.button>

            <motion.button
              onClick={() => {
                setAnalyzeMethod('image')
                setValidationErrors({})
                setError(null)
              }}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${analyzeMethod === 'image'
                  ? 'bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white shadow-lg shadow-[#0fbf75]/20'
                  : 'bg-[#0a0f1a] text-gray-300 border border-white/10 hover:border-[#0fbf75]/30'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={18} />
              <span>Field Image</span>
            </motion.button>
          </div>
        </Reveal>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4"
          >
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4"
          >
            <div className="p-4 bg-[#0fbf75]/10 border border-[#0fbf75]/20 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={20} className="text-[#00D28A] flex-shrink-0 mt-0.5" />
              <p className="text-[#00D28A] text-sm">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {analyzeMethod === 'sensor' && (
              <motion.form
                onSubmit={handleSensorSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Reveal>
                  <GlassPanel className="p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Enter Sensor Readings</h2>

                    <div className="space-y-5">
                      {/* Soil Moisture */}
                      <Reveal delay={0.05}>
                        <motion.div animate={validationErrors.soil_moisture ? { x: [-4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Soil Moisture (%)</label>
                          <input type="number" name="soil_moisture" min="0" max="100" step="0.1" value={sensorData.soil_moisture} onChange={handleSensorChange} placeholder="0-100" disabled={loading} className={inputClassName('soil_moisture')} />
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-600">Optimal: 40-60%</p>
                            <AnimatePresence mode="wait">{validationErrors.soil_moisture && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-400">{validationErrors.soil_moisture}</motion.p>)}</AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Temperature */}
                      <Reveal delay={0.1}>
                        <motion.div animate={validationErrors.temperature ? { x: [-4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Temperature (°C)</label>
                          <input type="number" name="temperature" min="-50" max="50" step="0.1" value={sensorData.temperature} onChange={handleSensorChange} placeholder="-50 to 50" disabled={loading} className={inputClassName('temperature')} />
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-600">Optimal: 20-25°C</p>
                            <AnimatePresence mode="wait">{validationErrors.temperature && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-400">{validationErrors.temperature}</motion.p>)}</AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Humidity */}
                      <Reveal delay={0.15}>
                        <motion.div animate={validationErrors.humidity ? { x: [-4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Humidity (%)</label>
                          <input type="number" name="humidity" min="0" max="100" step="0.1" value={sensorData.humidity} onChange={handleSensorChange} placeholder="0-100" disabled={loading} className={inputClassName('humidity')} />
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-600">Optimal: 60-80%</p>
                            <AnimatePresence mode="wait">{validationErrors.humidity && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-400">{validationErrors.humidity}</motion.p>)}</AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Leaf Wetness */}
                      <Reveal delay={0.2}>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Leaf Wetness (%)</label>
                          <input type="number" name="leaf_wetness" min="0" max="100" step="0.1" value={sensorData.leaf_wetness} onChange={handleSensorChange} placeholder="0-100" disabled={loading} className={inputClassName('leaf_wetness')} />
                          <p className="text-xs text-gray-600 mt-1.5">Indicates disease risk</p>
                        </div>
                      </Reveal>

                      {/* pH Level */}
                      <Reveal delay={0.25}>
                        <motion.div animate={validationErrors.ph_level ? { x: [-4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">pH Level</label>
                          <input type="number" name="ph_level" min="0" max="14" step="0.1" value={sensorData.ph_level} onChange={handleSensorChange} placeholder="0-14" disabled={loading} className={inputClassName('ph_level')} />
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-600">Optimal: 6-7</p>
                            <AnimatePresence mode="wait">{validationErrors.ph_level && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-400">{validationErrors.ph_level}</motion.p>)}</AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>
                    </div>

                    <Reveal delay={0.3}>
                      <div className="mt-8">
                        <GradientButton onClick={handleSensorSubmit} className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2">
                          {loading ? 'Analyzing...' : 'Analyze Crop Health'}
                          <ChevronRight size={20} />
                        </GradientButton>
                      </div>
                    </Reveal>
                  </GlassPanel>
                </Reveal>
              </motion.form>
            )}

            {analyzeMethod === 'image' && (
              <motion.form
                onSubmit={handleImageSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Reveal>
                  <GlassPanel className="p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Upload Field Image</h2>

                    <div className="mb-6">
                      <input type="file" id="image-input" accept="image/*" onChange={handleImageSelect} disabled={loading} className="hidden" />
                      <label
                        htmlFor="image-input"
                        className="block p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-[#0fbf75]/30 transition-colors cursor-pointer"
                      >
                        {imagePreview ? (
                          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                            <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl mb-4" />
                            <p className="text-sm text-gray-500">Click to change image</p>
                          </motion.div>
                        ) : (
                          <div className="text-center py-12">
                            <motion.div animate={{ y: [-4, 4, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4">
                              <Upload size={48} className="mx-auto text-gray-600" />
                            </motion.div>
                            <p className="text-white font-semibold">Click or drag image here</p>
                            <p className="text-xs text-gray-600 mt-2">Supported: JPG, PNG, WebP</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <Reveal delay={0.1}>
                      <GradientButton onClick={handleImageSubmit} className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2" disabled={loading || !imageFile}>
                        {loading ? 'Analyzing Image...' : 'Analyze Image'}
                        <ChevronRight size={20} />
                      </GradientButton>
                    </Reveal>
                  </GlassPanel>
                </Reveal>
              </motion.form>
            )}
          </div>

          {/* Live Preview Sidebar */}
          {liveResults && (
            <Reveal delay={0.2}>
              <motion.div
                className="lg:sticky lg:top-24 h-fit"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 0.9, 0.13, 1] }}
              >
                <GlassPanel className="p-6 lg:p-8">
                  <h3 className="text-base font-bold text-white mb-5">Live Preview</h3>

                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center mb-6">
                    <div className={`inline-block px-4 py-2 rounded-full font-semibold text-sm text-white mb-3 ${liveResults.health_status === 'Healthy' ? 'bg-gradient-to-r from-[#0fbf75] to-[#00D28A]' : 'bg-red-500'
                      }`}>
                      {liveResults.health_status}
                    </div>
                    <p className="text-4xl font-bold text-white">{liveResults.confidence}%</p>
                    <p className="text-xs text-gray-500 mt-1">Confidence Score</p>
                  </motion.div>

                  <div className="border-t border-white/5 pt-5">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {liveResults.recommendations.map((rec, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0fbf75] mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-400">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analyze

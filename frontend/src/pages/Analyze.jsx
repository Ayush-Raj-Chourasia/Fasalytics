import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Zap, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, GradientButton, Reveal } from '../ui'
import '../styles/analyze.css'

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
    setSensorData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field on change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
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

  // Mock live results preview
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

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Reveal>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Crop Health Analysis
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Analyze your crops using sensor data or field images
            </p>
          </div>
        </Reveal>
      </div>

      {/* Method Selector */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Reveal delay={0.1}>
          <div className="flex gap-3 lg:gap-4 max-w-md">
            <motion.button
              onClick={() => {
                setAnalyzeMethod('sensor')
                setValidationErrors({})
                setError(null)
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                analyzeMethod === 'sensor'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary-green'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={20} />
              <span>Sensor Data</span>
            </motion.button>

            <motion.button
              onClick={() => {
                setAnalyzeMethod('image')
                setValidationErrors({})
                setError(null)
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                analyzeMethod === 'image'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary-green'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={20} />
              <span>Field Image</span>
            </motion.button>
          </div>
        </Reveal>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4"
          >
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4"
          >
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 dark:text-green-300">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section - 2 columns */}
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Enter Sensor Readings
                    </h2>

                    <div className="space-y-6">
                      {/* Soil Moisture */}
                      <Reveal delay={0.05}>
                        <motion.div
                          animate={validationErrors.soil_moisture ? { x: [-4, 4, -2, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Soil Moisture (%)
                          </label>
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
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                              validationErrors.soil_moisture
                                ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 dark:border-gray-700 focus:border-primary-green focus:ring-primary-green'
                            } focus:ring-2 focus:outline-none disabled:opacity-50`}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Optimal: 40-60%
                            </p>
                            <AnimatePresence mode="wait">
                              {validationErrors.soil_moisture && (
                                <motion.p
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="text-xs text-red-600 dark:text-red-400"
                                >
                                  {validationErrors.soil_moisture}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Temperature */}
                      <Reveal delay={0.1}>
                        <motion.div
                          animate={validationErrors.temperature ? { x: [-4, 4, -2, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Temperature (°C)
                          </label>
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
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                              validationErrors.temperature
                                ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 dark:border-gray-700 focus:border-primary-green focus:ring-primary-green'
                            } focus:ring-2 focus:outline-none disabled:opacity-50`}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Optimal: 20-25°C
                            </p>
                            <AnimatePresence mode="wait">
                              {validationErrors.temperature && (
                                <motion.p
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="text-xs text-red-600 dark:text-red-400"
                                >
                                  {validationErrors.temperature}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Humidity */}
                      <Reveal delay={0.15}>
                        <motion.div
                          animate={validationErrors.humidity ? { x: [-4, 4, -2, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Humidity (%)
                          </label>
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
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                              validationErrors.humidity
                                ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 dark:border-gray-700 focus:border-primary-green focus:ring-primary-green'
                            } focus:ring-2 focus:outline-none disabled:opacity-50`}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Optimal: 60-80%
                            </p>
                            <AnimatePresence mode="wait">
                              {validationErrors.humidity && (
                                <motion.p
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="text-xs text-red-600 dark:text-red-400"
                                >
                                  {validationErrors.humidity}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>

                      {/* Leaf Wetness */}
                      <Reveal delay={0.2}>
                        <motion.div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Leaf Wetness (%)
                          </label>
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
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all disabled:opacity-50"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Indicates disease risk
                          </p>
                        </motion.div>
                      </Reveal>

                      {/* pH Level */}
                      <Reveal delay={0.25}>
                        <motion.div
                          animate={validationErrors.ph_level ? { x: [-4, 4, -2, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            pH Level
                          </label>
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
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                              validationErrors.ph_level
                                ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 dark:border-gray-700 focus:border-primary-green focus:ring-primary-green'
                            } focus:ring-2 focus:outline-none disabled:opacity-50`}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Optimal: 6-7
                            </p>
                            <AnimatePresence mode="wait">
                              {validationErrors.ph_level && (
                                <motion.p
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="text-xs text-red-600 dark:text-red-400"
                                >
                                  {validationErrors.ph_level}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </Reveal>
                    </div>

                    <Reveal delay={0.3}>
                      <div className="mt-8">
                        <GradientButton
                          onClick={handleSensorSubmit}
                          className="w-full py-3 text-lg font-semibold flex items-center justify-center gap-2"
                        >
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Upload Field Image
                    </h2>

                    <div className="mb-6">
                      <input
                        type="file"
                        id="image-input"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={loading}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-input"
                        className="block p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-green transition-colors cursor-pointer"
                      >
                        {imagePreview ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg mb-4"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to change image
                            </p>
                          </motion.div>
                        ) : (
                          <div className="text-center py-12">
                            <motion.div
                              animate={{ y: [-4, 4, -2, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="mb-4"
                            >
                              <Upload size={48} className="mx-auto text-gray-400" />
                            </motion.div>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              Click or drag image here
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Supported: JPG, PNG, WebP
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    <Reveal delay={0.1}>
                      <div>
                        <GradientButton
                          onClick={handleImageSubmit}
                          className="w-full py-3 text-lg font-semibold flex items-center justify-center gap-2"
                          disabled={loading || !imageFile}
                        >
                          {loading ? 'Analyzing Image...' : 'Analyze Image'}
                          <ChevronRight size={20} />
                        </GradientButton>
                      </div>
                    </Reveal>
                  </GlassPanel>
                </Reveal>
              </motion.form>
            )}
          </div>

          {/* Sticky Results Preview - 1 column */}
          {liveResults && (
            <Reveal delay={0.2}>
              <motion.div
                className="lg:sticky lg:top-8 h-fit"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 0.9, 0.13, 1] }}
              >
                <GlassPanel className="p-6 lg:p-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Live Preview
                  </h3>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center mb-6"
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-full font-semibold text-white mb-3 ${
                        liveResults.health_status === 'Healthy'
                          ? 'bg-gradient-primary'
                          : 'bg-red-500'
                      }`}
                    >
                      {liveResults.health_status}
                    </div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {liveResults.confidence}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Confidence Score
                    </p>
                  </motion.div>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {liveResults.recommendations.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-green mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {rec}
                          </p>
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

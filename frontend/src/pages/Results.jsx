import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, AlertCircle, TrendingUp, 
  Download, ArrowLeft, Share2, Zap
} from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, Reveal, GradientButton } from '../ui'
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
      { zone: 'East', status: 'stressed' },
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
  if (error) return (
    <div className="container mx-auto px-4 py-12">
      <p className="text-red-600">{error}</p>
    </div>
  )

  const isHealthy = mockResult.prediction_status === 'healthy'

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header with Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.button
          onClick={() => navigate('/history')}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-green transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to History
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Primary Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Status Hero Card */}
            <Reveal>
              <GlassPanel>
                <div className="p-8 lg:p-10">
                  <div className="flex items-start gap-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 0.9, 0.13, 1] }}
                    >
                      <div
                        className={`p-4 rounded-full ${
                          isHealthy
                            ? 'bg-gradient-primary/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2
                            size={48}
                            className="text-gradient-to-r from-primary-green to-accent"
                          />
                        ) : (
                          <AlertCircle
                            size={48}
                            className="text-red-500"
                          />
                        )}
                      </div>
                    </motion.div>

                    <div className="flex-1">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {mockResult.crop_type} Analysis
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                        {mockResult.field_name} • {new Date(mockResult.timestamp).toLocaleDateString()}
                      </p>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white ${
                          isHealthy
                            ? 'bg-gradient-primary'
                            : 'bg-red-500'
                        }`}
                      >
                        <Zap size={18} />
                        {isHealthy ? 'Crop is Healthy' : 'Crop Showing Stress'}
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4"
                      >
                        <div className="flex items-center gap-2 text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                          <TrendingUp size={28} className="text-primary-green" />
                          {mockResult.confidence.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Confidence Score
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Recommendation Card */}
            <Reveal delay={0.1}>
              <GlassPanel className="p-8 lg:p-10 border-l-4 border-primary-green">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  📋 Recommended Actions
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {mockResult.recommendation}
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-gap-3 mt-4 flex"
                >
                  <div className="w-1 h-full bg-gradient-primary rounded-full" />
                  <div>
                    <p className="text-xs font-semibold text-primary-green uppercase tracking-wide mb-2">
                      Key Takeaway
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isHealthy
                        ? 'Continue monitoring with weekly checks'
                        : 'Immediate intervention may be required'}
                    </p>
                  </div>
                </motion.div>
              </GlassPanel>
            </Reveal>

            {/* Environmental Data Grid */}
            <Reveal delay={0.2}>
              <GlassPanel className="p-8 lg:p-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  🌡️ Environmental Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Temperature', value: `${mockResult.temperature}°C`, optimal: '20-25°C' },
                    { label: 'Humidity', value: `${mockResult.humidity}%`, optimal: '60-80%' },
                    { label: 'Soil Moisture', value: `${mockResult.soil_moisture}%`, optimal: '40-60%' },
                    { label: 'pH Level', value: mockResult.ph_level, optimal: '6-7' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                    >
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {item.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Optimal: {item.optimal}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </Reveal>

            {/* Field Zone Status */}
            {mockResult.zone_map && mockResult.zone_map.length > 0 && (
              <Reveal delay={0.3}>
                <GlassPanel className="p-8 lg:p-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    📍 Field Zone Status
                  </h3>

                  {/* Zone Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {mockResult.zone_map.map((zone, i) => {
                      const isZoneHealthy = zone.status === 'healthy'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isZoneHealthy
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            {zone.zone}
                          </p>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isZoneHealthy ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <p
                              className={`text-xs font-semibold ${
                                isZoneHealthy
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-red-700 dark:text-red-300'
                              }`}
                            >
                              {isZoneHealthy ? 'Healthy' : 'Stressed'}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Healthy Zone
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Stressed Zone
                      </span>
                    </div>
                  </div>
                </GlassPanel>
              </Reveal>
            )}

            {/* Stress Info */}
            {!isHealthy && (
              <Reveal delay={0.4}>
                <GlassPanel className="p-8 lg:p-10 border-l-4 border-red-500">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={24} className="text-red-500" />
                    Stress Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {mockResult.stress_reason}
                  </p>
                </GlassPanel>
              </Reveal>
            )}
          </div>

          {/* Sidebar - Actions & Export */}
          <div className="lg:sticky lg:top-8 h-fit space-y-4">
            <Reveal delay={0.15}>
              <GlassPanel className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  <GradientButton
                    onClick={handleExportPDF}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </GradientButton>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-primary-green transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={20} />
                    Share Results
                  </motion.button>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Summary Card */}
            <Reveal delay={0.25}>
              <GlassPanel className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span
                      className={`font-semibold ${
                        isHealthy
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isHealthy ? 'Healthy' : 'Stressed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Confidence
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {mockResult.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Analyzed
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(mockResult.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Next Steps */}
            <Reveal delay={0.35}>
              <GlassPanel className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'Monitor crop regularly',
                    'Track sensor readings',
                    'Follow recommendations',
                    'Export for records'
                  ].map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                      {step}
                    </motion.li>
                  ))}
                </ul>
              </GlassPanel>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results

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

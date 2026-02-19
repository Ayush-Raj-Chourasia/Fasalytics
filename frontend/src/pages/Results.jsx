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

function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => { fetchResults() }, [id])

  const fetchResults = async () => {
    try {
      const response = await api.getResults(id)
      setResult(response.data)
    } catch (err) {
      setError('Failed to load analysis results')
    } finally {
      setLoading(false)
    }
  }

  const mockResult = result || {
    id,
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
    } catch {
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="min-h-screen bg-[#0F1724] pt-24 px-4">
      <div className="max-w-7xl mx-auto"><p className="text-red-400">{error}</p></div>
    </div>
  )

  const isHealthy = mockResult.prediction_status === 'healthy'

  return (
    <div className="min-h-screen bg-[#0F1724] pt-24">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.button
          onClick={() => navigate('/history')}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-500 hover:text-[#00D28A] transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to History</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-6">
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
                      <div className={`p-4 rounded-2xl ${isHealthy ? 'bg-[#0fbf75]/10' : 'bg-red-500/10'}`}>
                        {isHealthy
                          ? <CheckCircle2 size={40} className="text-[#00D28A]" />
                          : <AlertCircle size={40} className="text-red-400" />
                        }
                      </div>
                    </motion.div>

                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{mockResult.crop_type} Analysis</h1>
                      <p className="text-gray-500 text-sm mb-4">
                        {mockResult.field_name} • {new Date(mockResult.timestamp).toLocaleDateString()}
                      </p>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white ${isHealthy ? 'bg-gradient-to-r from-[#0fbf75] to-[#00D28A]' : 'bg-red-500'
                          }`}
                      >
                        <Zap size={16} />
                        {isHealthy ? 'Crop is Healthy' : 'Crop Showing Stress'}
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-5"
                      >
                        <div className="flex items-center gap-2 text-2xl lg:text-3xl font-bold text-white">
                          <TrendingUp size={24} className="text-[#0fbf75]" />
                          {mockResult.confidence.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Confidence Score</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Recommendation Card */}
            <Reveal delay={0.1}>
              <GlassPanel className="p-8 lg:p-10 border-l-4 border-l-[#0fbf75]">
                <h3 className="text-lg font-bold text-white mb-3">📋 Recommended Actions</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{mockResult.recommendation}</p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 mt-4">
                  <div className="w-1 bg-gradient-to-b from-[#0fbf75] to-[#00D28A] rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#0fbf75] uppercase tracking-wider mb-1">Key Takeaway</p>
                    <p className="text-xs text-gray-500">
                      {isHealthy ? 'Continue monitoring with weekly checks' : 'Immediate intervention may be required'}
                    </p>
                  </div>
                </motion.div>
              </GlassPanel>
            </Reveal>

            {/* Environmental Data Grid */}
            <Reveal delay={0.2}>
              <GlassPanel className="p-8 lg:p-10">
                <h3 className="text-lg font-bold text-white mb-6">🌡️ Environmental Conditions</h3>
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
                      className="p-4 rounded-xl bg-[#0a0f1a] border border-white/5"
                    >
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                      <p className="text-xl font-bold text-white mb-1">{item.value}</p>
                      <p className="text-[11px] text-gray-600">Optimal: {item.optimal}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </Reveal>

            {/* Field Zone Status */}
            {mockResult.zone_map?.length > 0 && (
              <Reveal delay={0.3}>
                <GlassPanel className="p-8 lg:p-10">
                  <h3 className="text-lg font-bold text-white mb-6">📍 Field Zone Status</h3>
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
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${isZoneHealthy
                              ? 'bg-[#0fbf75]/5 border-[#0fbf75]/20'
                              : 'bg-red-500/5 border-red-500/20'
                            }`}
                        >
                          <p className="text-sm font-semibold text-white mb-2">{zone.zone}</p>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isZoneHealthy ? 'bg-[#00D28A]' : 'bg-red-400'}`} />
                            <p className={`text-xs font-semibold ${isZoneHealthy ? 'text-[#00D28A]' : 'text-red-400'}`}>
                              {isZoneHealthy ? 'Healthy' : 'Stressed'}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00D28A]" />
                      <span className="text-gray-500 text-xs">Healthy Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="text-gray-500 text-xs">Stressed Zone</span>
                    </div>
                  </div>
                </GlassPanel>
              </Reveal>
            )}

            {/* Stress Info */}
            {!isHealthy && (
              <Reveal delay={0.4}>
                <GlassPanel className="p-8 lg:p-10 border-l-4 border-l-red-500">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-400" />
                    Stress Analysis
                  </h3>
                  <p className="text-gray-400 text-sm">{mockResult.stress_reason}</p>
                </GlassPanel>
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <Reveal delay={0.15}>
              <GlassPanel className="p-6">
                <h3 className="text-base font-bold text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <GradientButton
                    onClick={handleExportPDF}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={18} />
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </GradientButton>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#0a0f1a] text-gray-300 border border-white/10 hover:border-[#0fbf75]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Share Results
                  </motion.button>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Summary Card */}
            <Reveal delay={0.25}>
              <GlassPanel className="p-6">
                <h3 className="text-base font-bold text-white mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold ${isHealthy ? 'text-[#00D28A]' : 'text-red-400'}`}>
                      {isHealthy ? 'Healthy' : 'Stressed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Confidence</span>
                    <span className="font-semibold text-white">{mockResult.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Analyzed</span>
                    <span className="font-semibold text-white">{new Date(mockResult.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </GlassPanel>
            </Reveal>

            {/* Next Steps */}
            <Reveal delay={0.35}>
              <GlassPanel className="p-6">
                <h3 className="text-base font-bold text-white mb-4">Next Steps</h3>
                <ul className="space-y-2.5 text-sm">
                  {['Monitor crop regularly', 'Track sensor readings', 'Follow recommendations', 'Export for records'].map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-start gap-2 text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0fbf75] mt-1.5 flex-shrink-0" />
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

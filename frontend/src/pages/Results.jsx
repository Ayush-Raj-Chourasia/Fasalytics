import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api/client'

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

  const data = result || {
    id,
    prediction_status: 'healthy',
    confidence: 94.2,
    crop_type: 'Wheat',
    field_name: 'Sunnyvale Orchard',
    recommendation: 'Continue current irrigation schedule. Soil moisture levels are optimal for this growth stage.',
    stress_reason: 'N/A',
    timestamp: new Date().toISOString(),
    soil_moisture: 55,
    temperature: 22.5,
    humidity: 72,
    ph_level: 6.8,
    zone_map: [
      { zone: 'North Field', status: 'healthy' },
      { zone: 'South Field', status: 'healthy' },
      { zone: 'East Field', status: 'stressed' },
      { zone: 'West Field', status: 'healthy' }
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

  if (loading) return (
    <div className="min-h-screen bg-[#07281b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#00ff4c]/30 border-t-[#00ff4c] rounded-full animate-spin" />
        <p className="text-[#8faeb0] text-sm">Loading results...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#07281b] flex items-center justify-center px-4">
      <div className="glass-panel rounded-xl p-8 text-center max-w-md">
        <span className="material-icons-round text-4xl text-red-400 mb-3 block">error_outline</span>
        <p className="text-white font-bold mb-2">Failed to Load</p>
        <p className="text-[#8faeb0] text-sm mb-4">{error}</p>
        <button onClick={() => navigate('/history')} className="text-[#00ff4c] text-sm font-medium">Return to History</button>
      </div>
    </div>
  )

  const isHealthy = data.prediction_status === 'healthy'

  const metrics = [
    { label: 'Soil Moisture', value: `${data.soil_moisture}%`, optimal: '40-60%', icon: 'water_drop', color: '#3b82f6', borderColor: 'border-l-blue-500' },
    { label: 'Temperature', value: `${data.temperature}°C`, optimal: '20-25°C', icon: 'thermostat', color: '#f59e0b', borderColor: 'border-l-yellow-500' },
    { label: 'Humidity', value: `${data.humidity}%`, optimal: '60-80%', icon: 'humidity_mid', color: '#06b6d4', borderColor: 'border-l-cyan-500' },
    { label: 'pH Level', value: `${data.ph_level}`, optimal: '6.0-7.0', icon: 'science', color: '#8b5cf6', borderColor: 'border-l-purple-500' },
  ]

  const aiSteps = [
    'Continue current watering schedule — soil moisture is within optimal range.',
    'Monitor temperature trends over the next 48h for any heat stress indicators.',
    'Schedule preventive fungicide application if humidity exceeds 85%.',
    'Perform leaf tissue sampling in the East zone to assess nutrient uptake.',
    'Update crop rotation plan based on current soil pH levels.'
  ]

  return (
    <div className="min-h-screen bg-[#07281b]">
      {/* Top Bar */}
      <header className="bg-[#07281b]/80 backdrop-blur-md border-b border-[#00ff4c]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#8faeb0] mb-1">
              <button onClick={() => navigate('/dashboard')} className="hover:text-[#00ff4c] transition-colors">Dashboard</button>
              <span className="material-icons-round text-xs">chevron_right</span>
              <button onClick={() => navigate('/history')} className="hover:text-[#00ff4c] transition-colors">History</button>
              <span className="material-icons-round text-xs">chevron_right</span>
              <span className="text-white">Report #{id}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/history')} className="px-3 py-2 text-sm text-[#8faeb0] hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
              <span className="material-icons-round text-lg">arrow_back</span> Back
            </button>
            <button onClick={() => navigate('/analyze')} className="bg-[#00ff4c] hover:bg-[#00cc3e] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[#00ff4c]/20 transition-all flex items-center gap-2">
              <span className="material-icons-round text-sm">add</span> New Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-panel rounded-xl p-6 border-l-4 ${isHealthy ? 'border-l-[#00ff4c]' : 'border-l-red-500'}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isHealthy ? 'bg-[#00ff4c]/20' : 'bg-red-500/20'}`}>
                    <span className={`material-icons-round text-3xl ${isHealthy ? 'text-[#00ff4c]' : 'text-red-500'}`}>
                      {isHealthy ? 'check_circle' : 'warning'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{data.crop_type} — {data.field_name}</h2>
                    <p className="text-sm text-[#8faeb0] mt-1">
                      Analyzed on {new Date(data.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${
                      isHealthy
                        ? 'bg-[#00ff4c]/10 text-[#00ff4c] border border-[#00ff4c]/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#00ff4c]' : 'bg-red-500 animate-pulse'}`} />
                      {isHealthy ? 'Healthy Crop Detected' : 'Stress Detected'}
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="relative w-24 h-24 mx-auto sm:mx-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#0a2f22" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={isHealthy ? '#00ff4c' : '#ef4444'} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${data.confidence * 2.639} 263.9`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">{data.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8faeb0] mt-1">Confidence</p>
                </div>
              </div>
            </motion.div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`glass-panel rounded-xl p-4 border-l-4 ${m.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons-round text-lg" style={{ color: m.color }}>{m.icon}</span>
                    <span className="text-xs text-[#8faeb0] font-medium">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-[#8faeb0] mt-1">Optimal: {m.optimal}</p>
                </motion.div>
              ))}
            </div>

            {/* Zone Map */}
            {data.zone_map?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-icons-round text-[#00ff4c]">satellite_alt</span>
                    Zone Health Map
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#00ff4c]" /><span className="text-xs text-[#8faeb0]">Healthy</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-[#8faeb0]">Stressed</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.zone_map.map((zone, i) => {
                    const zHealthy = zone.status === 'healthy'
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className={`p-5 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                          zHealthy ? 'bg-[#00ff4c]/5 border-[#00ff4c]/20 hover:border-[#00ff4c]/40' : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`material-icons-round ${zHealthy ? 'text-[#00ff4c]' : 'text-red-500'}`}>
                              {zHealthy ? 'check_circle' : 'error'}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">{zone.zone}</p>
                              <p className={`text-xs font-medium ${zHealthy ? 'text-[#00ff4c]' : 'text-red-400'}`}>
                                {zHealthy ? 'Optimal Health' : 'Needs Attention'}
                              </p>
                            </div>
                          </div>
                          <span className="material-icons-round text-gray-600 text-lg">chevron_right</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-[#00ff4c]/20 rounded-lg">
                  <span className="material-icons-round text-[#00ff4c]">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Recommendations</h3>
                  <p className="text-xs text-[#8faeb0]">Generated based on your analysis data</p>
                </div>
              </div>
              <div className="space-y-3">
                {aiSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#071f15] border border-white/5 hover:border-[#00ff4c]/20 transition-colors"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00ff4c]/10 flex items-center justify-center text-xs font-bold text-[#00ff4c]">{i + 1}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stress Reason (if stressed) */}
            {!isHealthy && data.stress_reason && data.stress_reason !== 'N/A' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6 border-l-4 border-l-red-500"
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-icons-round text-red-400">report_problem</span>
                  Stress Analysis
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{data.stress_reason}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-xl p-6 lg:sticky lg:top-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="w-full bg-[#00ff4c] hover:bg-[#00cc3e] disabled:opacity-50 text-white py-3 rounded-lg font-medium shadow-lg shadow-[#00ff4c]/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-icons-round text-lg">picture_as_pdf</span>
                  {exporting ? 'Generating PDF...' : 'Export Full Report'}
                </button>
                <button className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-[#071f15] text-gray-300 border border-white/10 hover:border-[#00ff4c]/30 transition-all flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">share</span>
                  Share Results
                </button>
                <button className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-[#071f15] text-gray-300 border border-white/10 hover:border-[#00ff4c]/30 transition-all flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">assignment</span>
                  Create Work Order
                </button>
              </div>
            </motion.div>

            {/* Analysis Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Analysis Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Status', value: isHealthy ? 'Healthy' : 'Stressed', color: isHealthy ? 'text-[#00ff4c]' : 'text-red-500' },
                  { label: 'Confidence', value: `${data.confidence.toFixed(1)}%`, color: 'text-white' },
                  { label: 'Crop Type', value: data.crop_type, color: 'text-white' },
                  { label: 'Field', value: data.field_name, color: 'text-white' },
                  { label: 'Analyzed', value: new Date(data.timestamp).toLocaleDateString(), color: 'text-white' },
                  { label: 'Report ID', value: `#${id}`, color: 'text-[#8faeb0]' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-[#8faeb0]">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Historical Context */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Historical Context</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Season Avg', value: '91.2%', icon: 'analytics', color: 'text-[#00ff4c]', bg: 'bg-[#00ff4c]/20' },
                  { label: 'Peak Score', value: '98.1%', icon: 'emoji_events', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                  { label: 'Total Scans', value: '47', icon: 'assessment', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                  { label: 'Streak', value: '12 days', icon: 'local_fire_department', color: 'text-orange-400', bg: 'bg-orange-500/20' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#071f15] border border-white/5 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                      <span className={`material-icons-round text-lg ${s.color}`}>{s.icon}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-xs text-[#8faeb0]">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results

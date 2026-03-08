import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api/client'

const zones = [
  { label: 'North Zone', status: 'good', icon: 'north', value: 95 },
  { label: 'East Zone', status: 'moderate', icon: 'east', value: 78 },
  { label: 'South Zone', status: 'good', icon: 'south', value: 92 },
  { label: 'West Zone', status: 'critical', icon: 'west', value: 54 },
  { label: 'Central', status: 'good', icon: 'center_focus_strong', value: 88 },
]

function Results() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => { fetchResults() }, [id])

  const fetchResults = async () => {
    try {
      const response = await api.getResults(id)
      setResult(response.data)
    } catch (err) {
      setFetchError('Could not load analysis results. The record may not exist or the server is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const data = result || {}

  const isHealthy = data.prediction_status === 'healthy'

  const metrics = [
    { label: 'Soil Moisture', value: `${data.soil_moisture}%`, icon: 'water_drop', color: '#3b82f6', bg: 'bg-blue-500/10' },
    { label: 'Temperature', value: `${data.temperature}°C`, icon: 'thermostat', color: '#f59e0b', bg: 'bg-yellow-500/10' },
    { label: 'Humidity', value: `${data.humidity}%`, icon: 'humidity_mid', color: '#06b6d4', bg: 'bg-cyan-500/10' },
    { label: 'pH Level', value: data.ph_level, icon: 'science', color: '#8b5cf6', bg: 'bg-purple-500/10' },
    { label: 'Leaf Wetness', value: `${data.leaf_wetness}%`, icon: 'eco', color: '#10b981', bg: 'bg-emerald-500/10' },
  ]

  const priorityStyles = {
    high: { color: 'text-red-400', bg: 'bg-red-500/10', icon: 'priority_high' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: 'remove' },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'check' },
  }

  const handleExport = async () => {
    try {
      const response = await api.exportPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analysis_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) return (
    <div className="h-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-[#8faeb0] text-sm">Loading results...</p>
      </div>
    </div>
  )

  if (fetchError) return (
    <div className="h-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
        <span className="material-icons-round text-5xl text-red-400">error_outline</span>
        <h2 className="text-white text-xl font-semibold">Results Not Found</h2>
        <p className="text-[#8faeb0] text-sm">{fetchError}</p>
        <button onClick={() => navigate('/analyze')} className="btn-primary mt-2">Run New Analysis</button>
      </div>
    </div>
  )

  return (
    <div className="h-full">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <div>
              <h1>{data.farm_name || 'Analysis Report'}</h1>
              <p>{data.crop_type} • {new Date(data.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <span className="material-icons-round text-sm">download</span> Export PDF
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <span className="material-icons-round text-sm">share</span> Share
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">

            {/* Hero Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 border ${isHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke={isHealthy ? '#10b981' : '#f87171'} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${data.confidence * 3.267} 326.7`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{data.confidence}%</span>
                    <span className="text-xs text-[#8faeb0]">Confidence</span>
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-3 ${isHealthy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                    }`}>
                    <span className="material-icons-round text-sm">{isHealthy ? 'check_circle' : 'warning'}</span>
                    {isHealthy ? 'Healthy' : 'Stressed'}
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isHealthy ? 'Crop Health looks great!' : 'Immediate attention required'}
                  </h2>
                  <p className="text-sm text-[#8faeb0] max-w-md">
                    {isHealthy
                      ? 'All major indicators are within optimal ranges. Continue current management practices for sustained growth.'
                      : 'Multiple stress indicators detected across your field. Review the recommendations below for corrective actions.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sensor Metrics */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-emerald-400">sensors</span>
                Sensor Readings
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {metrics.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="glass-panel rounded-xl p-4 text-center hover:border-white/20 transition-all"
                  >
                    <div className={`w-10 h-10 mx-auto rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                      <span className="material-icons-round" style={{ color: m.color }}>{m.icon}</span>
                    </div>
                    <p className="text-xl font-bold text-white">{m.value}</p>
                    <p className="text-xs text-[#8faeb0] mt-1">{m.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Zone Health Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-emerald-400">map</span>
                Zone Health Map
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {zones.map((zone, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-center transition-all hover:-translate-y-1 ${zone.status === 'good' ? 'bg-emerald-500/5 border-emerald-500/15'
                        : zone.status === 'moderate' ? 'bg-yellow-500/5 border-yellow-500/15'
                          : 'bg-red-500/5 border-red-500/15'
                      }`}
                  >
                    <span className={`material-icons-round text-2xl mb-2 block ${zone.status === 'good' ? 'text-emerald-400'
                        : zone.status === 'moderate' ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>{zone.icon}</span>
                    <p className="text-sm font-medium text-white">{zone.label}</p>
                    <p className={`text-lg font-bold mt-1 ${zone.status === 'good' ? 'text-emerald-400'
                        : zone.status === 'moderate' ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>{zone.value}%</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-emerald-400">auto_awesome</span>
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => {
                  const ps = priorityStyles[rec.priority]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#071f15] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${ps.bg} flex items-center justify-center`}>
                        <span className={`material-icons-round text-lg ${ps.color}`}>{ps.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${ps.color}`}>{rec.priority}</span>
                        </div>
                        <p className="text-sm text-[#8faeb0]">{rec.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-xl p-6 lg:sticky lg:top-6"
            >
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="material-icons-round text-emerald-400">bolt</span>
                Quick Actions
              </h3>
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/10"><span className="material-icons-round text-blue-400 text-lg">picture_as_pdf</span></div>
                  Export PDF Report
                </button>
                <button className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 text-left">
                  <div className="p-1.5 rounded-lg bg-purple-500/10"><span className="material-icons-round text-purple-400 text-lg">mail</span></div>
                  Email to Team
                </button>
                <button
                  onClick={() => navigate('/analyze')}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10"><span className="material-icons-round text-emerald-400 text-lg">replay</span></div>
                  Run New Analysis
                </button>
              </div>

              {/* Analysis Summary */}
              <div className="border-t border-white/5 pt-5">
                <h4 className="text-sm font-bold text-white mb-3">Analysis Summary</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Analysis ID', value: `#FAS-${String(id).padStart(5, '0')}` },
                    { label: 'Farm', value: data.farm_name },
                    { label: 'Crop Type', value: data.crop_type },
                    { label: 'Date', value: new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { label: 'Time', value: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-xs text-[#8faeb0]">{item.label}</span>
                      <span className="text-xs font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Context */}
              <div className="border-t border-white/5 pt-5 mt-5">
                <h4 className="text-sm font-bold text-white mb-3">Historical Context</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-[#071f15] text-center">
                    <p className="text-lg font-bold text-emerald-400">12</p>
                    <p className="text-[10px] text-[#8faeb0]">Past Analyses</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#071f15] text-center">
                    <p className="text-lg font-bold text-white">+3%</p>
                    <p className="text-[10px] text-[#8faeb0]">Improvement</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#071f15] text-center">
                    <p className="text-lg font-bold text-white">91.8%</p>
                    <p className="text-[10px] text-[#8faeb0]">Avg Score</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results

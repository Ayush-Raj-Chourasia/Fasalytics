import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api/client'

function History() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterStatus, setFilterStatus] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCrops, setSelectedCrops] = useState([])

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.getHistory()
      setAnalyses(response.data || [])
    } catch (err) {
      setError('Failed to load analysis history')
    } finally {
      setLoading(false)
    }
  }

  const mockAnalyses = analyses.length > 0 ? analyses : [
    { id: 1, timestamp: new Date(Date.now() - 86400000).toISOString(), prediction_status: 'healthy', confidence: 94.2, crop_type: 'Wheat', field_name: 'Sunnyvale Orchard', confidence_trend: [85, 88, 90, 91, 93, 94.2] },
    { id: 2, timestamp: new Date(Date.now() - 172800000).toISOString(), prediction_status: 'stressed', confidence: 87.5, crop_type: 'Corn', field_name: 'Green Valley Block A', confidence_trend: [92, 90, 89, 88, 87.5, 87] },
    { id: 3, timestamp: new Date(Date.now() - 259200000).toISOString(), prediction_status: 'healthy', confidence: 91.3, crop_type: 'Soybean', field_name: 'Highland Fields', confidence_trend: [82, 85, 87, 89, 90, 91.3] },
    { id: 4, timestamp: new Date(Date.now() - 345600000).toISOString(), prediction_status: 'healthy', confidence: 89.8, crop_type: 'Rice', field_name: 'Riverbank Plot 4', confidence_trend: [78, 82, 85, 87, 88, 89.8] },
    { id: 5, timestamp: new Date(Date.now() - 432000000).toISOString(), prediction_status: 'stressed', confidence: 76.4, crop_type: 'Wheat', field_name: 'North Ridge Field', confidence_trend: [88, 85, 82, 80, 78, 76.4] },
    { id: 6, timestamp: new Date(Date.now() - 518400000).toISOString(), prediction_status: 'healthy', confidence: 95.1, crop_type: 'Corn', field_name: 'Valley Bottom', confidence_trend: [90, 91, 92, 93, 94, 95.1] },
  ]

  let filteredAnalyses = mockAnalyses
  if (filterStatus !== 'all') filteredAnalyses = mockAnalyses.filter(a => a.prediction_status === filterStatus)
  if (selectedCrops.length > 0) filteredAnalyses = filteredAnalyses.filter(a => selectedCrops.includes(a.crop_type))

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.timestamp) - new Date(a.timestamp)
    if (sortBy === 'confidence') return b.confidence - a.confidence
    return 0
  })

  const cropTypes = [...new Set(mockAnalyses.map(a => a.crop_type))]
  const toggleCrop = (crop) => {
    setSelectedCrops(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop])
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Group by date
  const groupedByDate = sortedAnalyses.reduce((groups, analysis) => {
    const dateKey = formatDate(analysis.timestamp)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(analysis)
    return groups
  }, {})

  const totalHealthy = mockAnalyses.filter(a => a.prediction_status === 'healthy').length
  const totalStressed = mockAnalyses.filter(a => a.prediction_status === 'stressed').length
  const avgConfidence = (mockAnalyses.reduce((sum, a) => sum + a.confidence, 0) / mockAnalyses.length).toFixed(1)

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-[#8faeb0] text-sm">Loading history...</p>
      </div>
    </div>
  )

  return (
    <div className="h-full">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div>
            <h1>Analysis Timeline</h1>
            <p>View and filter your past crop analyses</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-styled"
            >
              <option value="recent">Most Recent</option>
              <option value="confidence">Highest Confidence</option>
            </select>
            <button
              onClick={() => navigate('/analyze')}
              className="bg-[#00ff4c] hover:bg-[#00cc3e] text-[#001a0a] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-[#00ff4c]/20 transition-all flex items-center gap-2"
            >
              <span className="material-icons-round text-sm">add</span> New Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5 lg:sticky lg:top-6">
              {/* Time Range */}
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-icons-round text-lg text-emerald-400">date_range</span>
                Time Range
              </h3>
              <div className="space-y-2 mb-6">
                {[
                  { label: 'Last 7 Days', value: '7d' },
                  { label: 'Last 30 Days', value: '30d' },
                  { label: 'Last 90 Days', value: '90d' },
                  { label: 'This Season', value: 'season' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="timeRange"
                      checked={timeRange === opt.value}
                      onChange={() => setTimeRange(opt.value)}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-sm text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Status Filter */}
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-icons-round text-lg text-emerald-400">filter_list</span>
                Status
              </h3>
              <div className="flex gap-2 mb-6">
                {['all', 'healthy', 'stressed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s
                        ? s === 'stressed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/10'
                      }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {/* Crop Type Filter */}
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-icons-round text-lg text-emerald-400">eco</span>
                Crop Type
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {cropTypes.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCrops.includes(crop) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/10'
                      }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Weekly Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8faeb0]">Total Analyses</span>
                    <span className="font-bold text-white">{mockAnalyses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8faeb0]">Healthy</span>
                    <span className="font-bold text-emerald-400">{totalHealthy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8faeb0]">Stressed</span>
                    <span className="font-bold text-red-400">{totalStressed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8faeb0]">Avg Confidence</span>
                    <span className="font-bold text-white">{avgConfidence}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Timeline Column */}
          <div className="lg:col-span-5 space-y-6">
            {sortedAnalyses.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-xl p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0a2f22] flex items-center justify-center mb-4">
                  <span className="material-icons-round text-3xl text-[#8faeb0]">search_off</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No analyses found</h2>
                <p className="text-[#8faeb0] text-sm mb-6">Try adjusting your filters or start a new analysis</p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="bg-[#00ff4c] hover:bg-[#00cc3e] text-[#001a0a] px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  Start Analysis
                </button>
              </motion.div>
            ) : (
              Object.entries(groupedByDate).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-icons-round text-lg text-emerald-400">calendar_today</span>
                    <h3 className="text-sm font-bold text-white">{dateLabel}</h3>
                    <span className="text-xs text-[#8faeb0] bg-white/5 px-2 py-0.5 rounded-full">{items.length} {items.length === 1 ? 'analysis' : 'analyses'}</span>
                  </div>
                  <div className="space-y-3 relative">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-emerald-500/10 hidden sm:block" />

                    <AnimatePresence mode="popLayout">
                      {items.map((analysis, i) => {
                        const isHealthy = analysis.prediction_status === 'healthy'
                        return (
                          <motion.div
                            key={analysis.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: i * 0.05 }}
                            layout
                            onClick={() => navigate(`/results/${analysis.id}`)}
                            className="glass-panel rounded-xl p-4 cursor-pointer hover:border-emerald-500/30 transition-all group relative"
                          >
                            {/* Timeline dot */}
                            <div className={`absolute left-4 top-6 w-3 h-3 rounded-full border-2 border-[#0d3b2c] hidden sm:block ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />

                            <div className="sm:pl-8">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{analysis.crop_type} — {analysis.field_name}</h4>
                                  </div>
                                  <p className="text-xs text-[#8faeb0]">{formatTime(analysis.timestamp)}</p>
                                </div>
                                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                  {isHealthy ? 'Healthy' : 'Stressed'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="material-icons-round text-sm text-emerald-400">speed</span>
                                    <span className="text-sm font-bold text-white">{analysis.confidence.toFixed(1)}%</span>
                                  </div>
                                </div>

                                {/* Mini Sparkline */}
                                {analysis.confidence_trend && (
                                  <div className="flex items-end gap-px h-5 opacity-50 group-hover:opacity-100 transition-opacity">
                                    {analysis.confidence_trend.map((val, idx) => {
                                      const minV = Math.min(...analysis.confidence_trend)
                                      const maxV = Math.max(...analysis.confidence_trend)
                                      const range = maxV - minV || 1
                                      const h = ((val - minV) / range) * 100
                                      return (
                                        <div
                                          key={idx}
                                          className={`w-1 rounded-t-sm ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`}
                                          style={{ height: `${Math.max(h, 10)}%` }}
                                        />
                                      )
                                    })}
                                  </div>
                                )}

                                <span className="material-icons-round text-gray-600 text-lg group-hover:text-emerald-400 transition-colors">chevron_right</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar - Quick Analysis */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-xl p-6 lg:sticky lg:top-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Quick Analysis</h3>
                <span className="flex items-center gap-1.5 text-xs text-[#8faeb0]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>

              {/* Latest result preview */}
              {sortedAnalyses.length > 0 && (() => {
                const latest = sortedAnalyses[0]
                const latestHealthy = latest.prediction_status === 'healthy'
                return (
                  <>
                    <div className="mb-6 text-center">
                      <div className="relative w-28 h-28 mx-auto mb-3">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#0a2f22" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={latestHealthy ? '#10b981' : '#f87171'} strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${latest.confidence * 2.639} 263.9`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">{latest.confidence.toFixed(1)}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">{latest.crop_type} — {latest.field_name}</p>
                      <p className="text-xs text-[#8faeb0] mt-1">Latest analysis</p>
                    </div>

                    {/* Sensor bars */}
                    <div className="space-y-3 mb-6">
                      {[
                        { label: 'Soil Moisture', value: 68, color: '#3b82f6' },
                        { label: 'Temperature', value: 45, color: '#f59e0b' },
                        { label: 'Humidity', value: 72, color: '#06b6d4' },
                        { label: 'pH Level', value: 49, color: '#8b5cf6' },
                      ].map((sensor, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#8faeb0]">{sensor.label}</span>
                            <span className="text-white font-medium">{sensor.value}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${sensor.value}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: sensor.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}

              {/* Recommended Actions */}
              <div className="border-t border-white/5 pt-5">
                <h4 className="text-xs font-semibold text-[#8faeb0] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-icons-round text-sm text-emerald-400">auto_awesome</span>
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {['Schedule field inspection for east zones', 'Update irrigation plan based on trends', 'Review seasonal performance reports'].map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#071f15] border border-white/5"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">{i + 1}</span>
                      <p className="text-xs text-gray-300">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/analyze')}
                className="w-full mt-5 bg-[#00ff4c] hover:bg-[#00cc3e] text-[#001a0a] py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-[#00ff4c]/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round text-lg">play_arrow</span>
                Run New Analysis
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default History

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, ChevronRight, Filter } from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, Reveal } from '../ui'
import LoadingSpinner from '../components/LoadingSpinner'

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterStatus, setFilterStatus] = useState('all')

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
    { id: 1, timestamp: new Date(Date.now() - 86400000).toISOString(), prediction_status: 'healthy', confidence: 94.2, crop_type: 'Wheat', field_name: 'Field A', confidence_trend: [85, 88, 90, 91, 93, 94.2] },
    { id: 2, timestamp: new Date(Date.now() - 172800000).toISOString(), prediction_status: 'stressed', confidence: 87.5, crop_type: 'Corn', field_name: 'Field B', confidence_trend: [92, 90, 89, 88, 87.5, 87] },
    { id: 3, timestamp: new Date(Date.now() - 259200000).toISOString(), prediction_status: 'healthy', confidence: 91.3, crop_type: 'Soybean', field_name: 'Field C', confidence_trend: [82, 85, 87, 89, 90, 91.3] },
    { id: 4, timestamp: new Date(Date.now() - 345600000).toISOString(), prediction_status: 'healthy', confidence: 89.8, crop_type: 'Rice', field_name: 'Field D', confidence_trend: [78, 82, 85, 87, 88, 89.8] }
  ]

  let filteredAnalyses = mockAnalyses
  if (filterStatus !== 'all') {
    filteredAnalyses = mockAnalyses.filter(a => a.prediction_status === filterStatus)
  }

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.timestamp) - new Date(a.timestamp)
    if (sortBy === 'confidence') return b.confidence - a.confidence
    return 0
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="min-h-screen bg-[#0F1724] pt-24 px-4">
      <div className="max-w-7xl mx-auto"><p className="text-red-400">{error}</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F1724] pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Reveal>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Analysis History</h1>
            <p className="mt-3 text-base text-gray-400">Review all your crop health analyses and trends</p>
          </div>
        </Reveal>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Reveal delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'All', value: 'all' },
                { label: 'Healthy', value: 'healthy' },
                { label: 'Stressed', value: 'stressed' }
              ].map((status) => (
                <motion.button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${filterStatus === status.value
                      ? 'bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white shadow-lg shadow-[#0fbf75]/20'
                      : 'bg-[#0a0f1a] text-gray-400 border border-white/10 hover:border-[#0fbf75]/30'
                    }`}
                >
                  {status.label}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-[#0a0f1a] text-gray-300 text-sm font-medium focus:border-[#0fbf75]/50 focus:ring-1 focus:ring-[#0fbf75]/20 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="confidence">Highest Confidence</option>
              </select>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Analyses List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {sortedAnalyses.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <motion.div animate={{ y: [-4, 4, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4 flex justify-center">
              <TrendingUp size={64} className="text-gray-700" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">No analyses yet</h2>
            <p className="text-gray-500 mb-8">Start analyzing your crops to see history here</p>
            <motion.a
              href="/analyze"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#0fbf75]/20 transition-shadow"
            >
              Start Analysis
            </motion.a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedAnalyses.map((analysis, index) => {
                const isHealthy = analysis.prediction_status === 'healthy'
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Link to={`/results/${analysis.id}`} className="block group">
                      <GlassPanel className="p-4 sm:p-6 hover:border-[#0fbf75]/30 transition-all">
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* Status Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-xl flex-shrink-0 ${isHealthy ? 'bg-[#0fbf75]/10' : 'bg-red-500/10'
                              }`}
                          >
                            {isHealthy
                              ? <CheckCircle2 size={24} className="text-[#00D28A]" />
                              : <AlertCircle size={24} className="text-red-400" />
                            }
                          </motion.div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <h3 className="text-base font-bold text-white group-hover:text-[#00D28A] transition-colors">{analysis.crop_type}</h3>
                                <p className="text-sm text-gray-500">{analysis.field_name}</p>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${isHealthy ? 'bg-[#0fbf75]/15 text-[#00D28A]' : 'bg-red-500/15 text-red-400'
                                  }`}
                              >
                                {isHealthy ? 'Healthy' : 'Stressed'}
                              </motion.span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Calendar size={14} />
                                <span>{formatDate(analysis.timestamp)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-[#0fbf75]" />
                                <span className="font-semibold text-white">{analysis.confidence.toFixed(1)}%</span>
                              </div>
                            </div>

                            {/* Mini Sparkline */}
                            {analysis.confidence_trend && (
                              <motion.div className="mt-3 h-6 flex items-end gap-0.5 opacity-40 group-hover:opacity-80 transition-opacity">
                                {analysis.confidence_trend.map((val, i) => {
                                  const minVal = Math.min(...analysis.confidence_trend)
                                  const maxVal = Math.max(...analysis.confidence_trend)
                                  const range = maxVal - minVal || 1
                                  const height = ((val - minVal) / range) * 100
                                  return (
                                    <motion.div
                                      key={i}
                                      initial={{ height: 0 }}
                                      animate={{ height: `${height}%` }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex-1 rounded-t-sm bg-gradient-to-t from-[#0fbf75] to-[#00D28A]"
                                    />
                                  )
                                })}
                              </motion.div>
                            )}
                          </div>

                          <motion.div whileHover={{ x: 4 }} className="text-gray-600 group-hover:text-[#0fbf75] transition-colors flex-shrink-0 mt-1">
                            <ChevronRight size={20} />
                          </motion.div>
                        </div>
                      </GlassPanel>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default History

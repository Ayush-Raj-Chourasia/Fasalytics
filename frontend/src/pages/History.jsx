import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, ChevronRight, Filter } from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, Reveal } from '../ui'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/history.css'

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'healthy', 'stressed'

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.getHistory()
      setAnalyses(response.data || [])
    } catch (err) {
      setError('Failed to load analysis history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const mockAnalyses = analyses.length > 0 ? analyses : [
    {
      id: 1,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      prediction_status: 'healthy',
      confidence: 94.2,
      crop_type: 'Wheat',
      field_name: 'Field A',
      confidence_trend: [85, 88, 90, 91, 93, 94.2]
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      prediction_status: 'stressed',
      confidence: 87.5,
      crop_type: 'Corn',
      field_name: 'Field B',
      confidence_trend: [92, 90, 89, 88, 87.5, 87]
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      prediction_status: 'healthy',
      confidence: 91.3,
      crop_type: 'Soybean',
      field_name: 'Field C',
      confidence_trend: [82, 85, 87, 89, 90, 91.3]
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      prediction_status: 'healthy',
      confidence: 89.8,
      crop_type: 'Rice',
      field_name: 'Field D',
      confidence_trend: [78, 82, 85, 87, 88, 89.8]
    }
  ]

  let filteredAnalyses = mockAnalyses
  if (filterStatus !== 'all') {
    filteredAnalyses = mockAnalyses.filter(a => a.prediction_status === filterStatus)
  }

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp) - new Date(a.timestamp)
    } else if (sortBy === 'confidence') {
      return b.confidence - a.confidence
    }
    return 0
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="container mx-auto px-4 py-12">
      <p className="text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Reveal>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Analysis History
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Review all your crop health analyses and trends
            </p>
          </div>
        </Reveal>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status.value
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {status.label}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="confidence">Highest Confidence</option>
              </select>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Analyses List */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {sortedAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mb-4 flex justify-center">
              <motion.div
                animate={{ y: [-4, 4, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp size={64} className="text-gray-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No analyses yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start analyzing your crops to see history here
            </p>
            <motion.a
              href="/analyze"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
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
                      <GlassPanel className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* Status Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-full flex-shrink-0 ${
                              isHealthy
                                ? 'bg-green-500/20'
                                : 'bg-red-500/20'
                            }`}
                          >
                            {isHealthy ? (
                              <CheckCircle2
                                size={28}
                                className="text-green-600 dark:text-green-400"
                              />
                            ) : (
                              <AlertCircle
                                size={28}
                                className="text-red-600 dark:text-red-400"
                              />
                            )}
                          </motion.div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-green transition-colors">
                                  {analysis.crop_type}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {analysis.field_name}
                                </p>
                              </div>

                              {/* Status Badge */}
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  isHealthy
                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                }`}
                              >
                                {isHealthy ? 'Healthy' : 'Stressed'}
                              </motion.span>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar size={16} />
                                <span>{formatDate(analysis.timestamp)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-primary-green" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {analysis.confidence.toFixed(1)}% Confidence
                                </span>
                              </div>
                            </div>

                            {/* Mini Sparkline */}
                            {analysis.confidence_trend && (
                              <motion.div className="mt-3 h-8 flex items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
                                      className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-green to-accent opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                  )
                                })}
                              </motion.div>
                            )}
                          </div>

                          {/* Arrow Icon */}
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="text-gray-400 group-hover:text-primary-green transition-colors flex-shrink-0 mt-1"
                          >
                            <ChevronRight size={24} />
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

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../api/client'
import { GlassPanel, Reveal, StatCard, SkeletonCard } from '../ui'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/dashboard.css'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.getDashboard()
      setDashboardData(response.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (error) return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
      <AlertCircle className="inline mr-2" />
      {error}
    </div>
  )

  const mockData = dashboardData || {
    total_analyses: 127,
    healthy_count: 89,
    stressed_count: 38,
    healthy_percentage: 70,
    stressed_percentage: 30,
    avg_confidence: 92.5,
    trend_data: [
      { name: 'Week 1', healthy: 20, stressed: 8 },
      { name: 'Week 2', healthy: 22, stressed: 10 },
      { name: 'Week 3', healthy: 25, stressed: 12 },
      { name: 'Week 4', healthy: 22, stressed: 8 }
    ]
  }

  const healthStatus = [
    { name: 'Healthy', value: mockData.healthy_count, fill: '#10b981' },
    { name: 'Stressed', value: mockData.stressed_count, fill: '#ef4444' }
  ]

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Reveal>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Overview of all crop health analyses and real-time metrics
            </p>
          </div>
        </Reveal>
      </div>

      {/* KPI Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-40" />)}
            </>
          ) : (
            <>
              <Reveal delay={0}>
                <StatCard
                  title="Total Analyses"
                  value={mockData.total_analyses}
                  trend={+12}
                  sparkline={[10, 15, 20, 22, 25, 28, 30, 32, 35]}
                />
              </Reveal>

              <Reveal delay={0.1}>
                <StatCard
                  title="Healthy Crops"
                  value={`${mockData.healthy_count}`}
                  trend={+8}
                  sparkline={[18, 20, 22, 25, 28, 32, 35, 38, 42]}
                />
              </Reveal>

              <Reveal delay={0.2}>
                <StatCard
                  title="Stressed Crops"
                  value={`${mockData.stressed_count}`}
                  trend={-5}
                  sparkline={[12, 11, 10, 9, 8, 7, 6, 5, 4]}
                />
              </Reveal>

              <Reveal delay={0.3}>
                <StatCard
                  title="Avg Confidence"
                  value={`${mockData.avg_confidence.toFixed(1)}%`}
                  trend={+3}
                  sparkline={[85, 87, 88, 89, 90, 91, 92, 92.5, 93]}
                />
              </Reveal>
            </>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Trend Chart */}
          <Reveal delay={0.2}>
            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Trend
              </h3>
              {loading ? (
                <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.trend_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" />
                    <YAxis stroke="rgba(0,0,0,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 36, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="healthy" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="stressed" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassPanel>
          </Reveal>

          {/* Health Status Pie */}
          <Reveal delay={0.3}>
            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Health Distribution
              </h3>
              {loading ? (
                <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={healthStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {healthStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 36, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 flex justify-center gap-6">
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Healthy</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {mockData.healthy_percentage}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stressed</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {mockData.stressed_percentage}%
                  </div>
                </div>
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

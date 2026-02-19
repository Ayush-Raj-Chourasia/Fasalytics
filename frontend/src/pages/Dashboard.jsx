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
    <div className="min-h-screen bg-[#0F1724] pt-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0fbf75]/10 to-[#00D28A]/5 border-b border-[#0fbf75]/20 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Crop Health Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring of your farm's crop health</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Reveal delay={0.1}>
                <StatCard
                  title="Total Analyses"
                  value={`${mockData.total_analyses}`}
                  trend={+8}
                  sparkline={[10, 15, 13, 18, 20, 22, 21, 25, 27]}
                />
              </Reveal>

              <Reveal delay={0.2}>
                <StatCard
                  title="Healthy Crops"
                  value={`${mockData.healthy_count}`}
                  trend={+5}
                  sparkline={[60, 65, 68, 70, 72, 75, 78, 82, 89]}
                />
              </Reveal>

              <Reveal delay={0.3}>
                <StatCard
                  title="Stressed Crops"
                  value={`${mockData.stressed_count}`}
                  trend={-5}
                  sparkline={[12, 11, 10, 9, 8, 7, 6, 5, 4]}
                />
              </Reveal>

              <Reveal delay={0.4}>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <Reveal delay={0.2}>
            <GlassPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-6">Weekly Trend</h3>
              {loading ? (
                <div className="h-80 bg-gradient-to-br from-[#0fbf75]/10 to-[#00D28A]/5 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.trend_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 36, 0.95)',
                        border: '1px solid rgba(15, 191, 117, 0.3)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="healthy" fill="#0fbf75" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="stressed" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassPanel>
          </Reveal>

          {/* Health Status */}
          <Reveal delay={0.3}>
            <GlassPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-6">Health Distribution</h3>
              {loading ? (
                <div className="h-80 bg-gradient-to-br from-[#0fbf75]/10 to-[#00D28A]/5 rounded-lg animate-pulse" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={healthStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {healthStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 flex justify-center gap-8">
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-[#0fbf75] mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Healthy {mockData.healthy_percentage}%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Stressed {mockData.stressed_percentage}%</p>
                    </div>
                  </div>
                </>
              )}
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

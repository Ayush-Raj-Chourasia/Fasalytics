import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { api } from '../api/client'

function Dashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.getDashboard()
      setDashboardData(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const data = dashboardData || {
    total_analyses: 0,
    healthy_count: 0,
    stressed_count: 0,
    healthy_percentage: 0,
    stressed_percentage: 0,
    avg_confidence: 0,
    trend_data: [],
    recent_analyses: []
  }

  const mockRecent = data.recent_analyses || []

  const pieData = [
    { name: 'Healthy', value: data.healthy_count, fill: '#10b981' },
    { name: 'High Stress', value: Math.round(data.stressed_count * 0.74), fill: '#f87171' },
    { name: 'Moderate Stress', value: Math.round(data.stressed_count * 0.26), fill: '#fbbf24' },
  ]

  const kpis = [
    { label: 'Total Analyses', value: data.total_analyses.toLocaleString(), trend: '+12%', trendUp: true, color: 'primary', icon: 'assessment' },
    { label: 'Healthy Crops', value: data.healthy_count.toLocaleString(), trend: '+5%', trendUp: true, color: 'primary', icon: 'spa' },
    { label: 'Stressed Crops', value: data.stressed_count.toLocaleString(), trend: '+2.4%', trendUp: true, color: 'danger', icon: 'warning' },
    { label: 'AI Confidence', value: `${data.avg_confidence}%`, trend: '-0.1%', trendUp: false, color: 'blue', icon: 'psychology' },
  ]

  const statusBadge = (status) => {
    if (status === 'healthy') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Healthy
      </span>
    )
    if (status === 'stressed') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Stressed
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Check Required
      </span>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0d3b2c', border: '1px solid rgba(0,255,76,0.2)', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <p style={{ color: 'white', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontSize: 13, margin: '3px 0' }}>
              {p.dataKey}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="flex-1 text-center sm:text-left">
            <h1>Overview</h1>
            <p>Welcome back, here's today's crop health analysis.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="material-icons-round text-[#8faeb0] text-sm">calendar_today</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="select-styled"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="season">This Season</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="bg-[#00ff4c] hover:bg-[#00cc3e] text-[#001a0a] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-[#00ff4c]/20 transition-all flex items-center gap-2"
            >
              <span className="material-icons-round text-sm">add</span> New Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-[#00ff4c]/30 ${
                kpi.color === 'danger' ? 'border-red-500/30' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-[#8faeb0]">{kpi.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${kpi.color === 'danger' ? 'bg-red-500/20' : kpi.color === 'blue' ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                  <span className={`material-icons-round ${kpi.color === 'danger' ? 'text-red-400' : kpi.color === 'blue' ? 'text-blue-400' : 'text-emerald-400'}`}>{kpi.icon}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${kpi.color === 'danger' ? 'text-red-400 bg-red-500/10' : kpi.trendUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 bg-gray-500/10'}`}>
                  <span className="material-icons-round text-xs mr-0.5">{kpi.trendUp ? 'trending_up' : 'remove'}</span> {kpi.trend}
                </span>
                <span className="text-[#8faeb0] text-xs">vs last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Weekly Crop Health Trend</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-[#8faeb0]">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-xs text-[#8faeb0]">Stressed</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={data.trend_data} barGap={6} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} horizontalPoints={[]} />
                <XAxis dataKey="name" stroke="#8faeb0" fontSize={12} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} dy={8} />
                <YAxis stroke="#8faeb0" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }} />
                <Bar dataKey="healthy" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="stressed" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-xl p-6 flex flex-col"
          >
            <h2 className="text-lg font-bold text-white mb-6">Current Distribution</h2>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{data.healthy_percentage}%</text>
                  <text x="50%" y="58%" textAnchor="middle" fill="#8faeb0" fontSize="10">{`HEALTHY`}</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.fill }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Analyses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Field Analyses</h2>
              <p className="text-xs text-[#8faeb0] mt-1">Latest crop health assessments from your fields</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm text-[#8faeb0] hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Filter</button>
              <button className="px-3 py-1.5 text-sm text-[#8faeb0] hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a2f22]/50 border-b border-white/5 text-[11px] uppercase tracking-wider text-[#8faeb0] font-semibold">
                  <th className="px-6 py-3.5 text-left">Farm Name</th>
                  <th className="px-6 py-3.5 text-left">Analysis Date</th>
                  <th className="px-6 py-3.5 text-left">Crop Type</th>
                  <th className="px-6 py-3.5 text-left">Confidence</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockRecent.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${row.iconBg} flex items-center justify-center ${row.iconColor}`}>
                          <span className="material-icons-round text-sm">{row.icon}</span>
                        </div>
                        <span className="font-medium text-gray-200 text-sm">{row.farm_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{row.date}</span>
                      <span className="text-xs text-gray-500 ml-1.5">{row.time}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{row.crop}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.confidence >= 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                            style={{ width: `${row.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${row.confidence >= 90 ? 'text-emerald-400' : 'text-yellow-400'}`}>{row.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(row.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/results/${row.id}`)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors inline-flex items-center gap-1 group-hover:gap-2"
                      >
                        View Report <span className="transition-all">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

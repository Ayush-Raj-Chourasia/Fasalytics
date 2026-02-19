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
    total_analyses: 2458,
    healthy_count: 1890,
    stressed_count: 568,
    healthy_percentage: 70,
    stressed_percentage: 30,
    avg_confidence: 96.4,
    trend_data: [
      { name: 'Mon', healthy: 70, stressed: 20 },
      { name: 'Tue', healthy: 65, stressed: 15 },
      { name: 'Wed', healthy: 80, stressed: 10 },
      { name: 'Thu', healthy: 50, stressed: 30 },
      { name: 'Fri', healthy: 75, stressed: 15 },
      { name: 'Sat', healthy: 85, stressed: 8 },
      { name: 'Sun', healthy: 78, stressed: 12 },
    ],
    recent_analyses: []
  }

  const mockRecent = data.recent_analyses?.length > 0 ? data.recent_analyses : [
    { id: 1, farm_name: 'Sunnyvale Orchard', date: 'Oct 24, 2023', time: '10:42 AM', crop: 'Wheat (Winter)', confidence: 98, status: 'healthy', icon: 'terrain', iconBg: 'bg-blue-900/30', iconColor: 'text-blue-400' },
    { id: 2, farm_name: 'Green Valley Block A', date: 'Oct 23, 2023', time: '04:15 PM', crop: 'Soybean', confidence: 88, status: 'stressed', icon: 'grass', iconBg: 'bg-purple-900/30', iconColor: 'text-purple-400' },
    { id: 3, farm_name: 'Highland Fields', date: 'Oct 23, 2023', time: '09:30 AM', crop: 'Corn (Maize)', confidence: 92, status: 'healthy', icon: 'landscape', iconBg: 'bg-orange-900/30', iconColor: 'text-orange-400' },
    { id: 4, farm_name: 'Riverbank Plot 4', date: 'Oct 22, 2023', time: '02:10 PM', crop: 'Rice', confidence: 95, status: 'warning', icon: 'eco', iconBg: 'bg-teal-900/30', iconColor: 'text-teal-400' },
  ]

  const pieData = [
    { name: 'Healthy', value: data.healthy_count, fill: '#0fbd74' },
    { name: 'High Stress', value: Math.round(data.stressed_count * 0.74), fill: '#ef4444' },
    { name: 'Moderate Stress', value: Math.round(data.stressed_count * 0.26), fill: '#f59e0b' },
  ]

  const kpis = [
    { label: 'Total Analyses', value: data.total_analyses.toLocaleString(), trend: '+12%', trendUp: true, color: 'primary', icon: 'assessment' },
    { label: 'Healthy Crops', value: data.healthy_count.toLocaleString(), trend: '+5%', trendUp: true, color: 'primary', icon: 'spa' },
    { label: 'Stressed Crops', value: data.stressed_count.toLocaleString(), trend: '+2.4%', trendUp: true, color: 'danger', icon: 'warning', border: true },
    { label: 'AI Confidence', value: `${data.avg_confidence}%`, trend: '-0.1%', trendUp: false, color: 'blue', icon: 'psychology' },
  ]

  const statusBadge = (status) => {
    if (status === 'healthy') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0fbd74]/10 text-[#0fbd74] border border-[#0fbd74]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0fbd74]" /> Healthy
      </span>
    )
    if (status === 'stressed') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Stressed
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Check Required
      </span>
    )
  }

  return (
    <div className="flex h-screen bg-[#10221a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-[#152e24] border-r border-[#0fbd74]/10 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-[#0fbd74]/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0fbd74] to-emerald-700 flex items-center justify-center text-white font-bold text-xl">F</div>
            <span className="text-lg font-bold tracking-tight text-white">Fasalytics</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-[#8faeb0] uppercase tracking-wider mb-2">Main</p>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0fbd74]/10 text-[#0fbd74] font-medium w-full text-left">
            <span className="material-icons-round text-xl">dashboard</span> Dashboard
          </button>
          <button onClick={() => navigate('/analyze')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#0fbd74]/5 hover:text-white transition-colors w-full text-left">
            <span className="material-icons-round text-xl">agriculture</span> Analyze
          </button>
          <button onClick={() => navigate('/history')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#0fbd74]/5 hover:text-white transition-colors w-full text-left">
            <span className="material-icons-round text-xl">analytics</span> History
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#0fbd74]/5 hover:text-white transition-colors w-full text-left">
            <span className="material-icons-round text-xl">notifications</span> Alerts
            <span className="ml-auto bg-[#0fbd74] text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
          </button>

          <p className="px-3 text-xs font-semibold text-[#8faeb0] uppercase tracking-wider mt-6 mb-2">System</p>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#0fbd74]/5 hover:text-white transition-colors w-full text-left">
            <span className="material-icons-round text-xl">settings</span> Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#0fbd74]/5 hover:text-white transition-colors w-full text-left">
            <span className="material-icons-round text-xl">help_outline</span> Support
          </button>
        </nav>

        <div className="p-4 border-t border-[#0fbd74]/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0fbd74]/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#1c3b2f] flex items-center justify-center text-[#0fbd74] font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. A. Sharma</p>
              <p className="text-xs text-[#8faeb0] truncate">Senior Agronomist</p>
            </div>
            <span className="material-icons-round text-gray-400 text-lg">more_vert</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#10221a]/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#0fbd74]/10">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <p className="text-sm text-[#8faeb0]">Welcome back, here's today's crop health analysis.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#152e24] px-3 py-2 rounded-lg border border-[#0fbd74]/20">
              <span className="material-icons-round text-gray-400 text-sm mr-2">calendar_today</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-200 cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="season">This Season</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="bg-[#0fbd74] hover:bg-[#0ca665] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[#0fbd74]/20 transition-all flex items-center gap-2"
            >
              <span className="material-icons-round text-sm">add</span> New Analysis
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-[#0fbd74]/30 ${kpi.border ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-[#8faeb0]">{kpi.label}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg ${kpi.color === 'danger' ? 'bg-red-500/20' : kpi.color === 'blue' ? 'bg-blue-500/20' : 'bg-[#0fbd74]/20'}`}>
                    <span className={`material-icons-round ${kpi.color === 'danger' ? 'text-red-500' : kpi.color === 'blue' ? 'text-blue-400' : 'text-[#0fbd74]'}`}>{kpi.icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${kpi.color === 'danger' ? 'text-red-500 bg-red-500/10' : kpi.trendUp ? 'text-[#0fbd74] bg-[#0fbd74]/10' : 'text-gray-400 bg-gray-500/10'}`}>
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
                    <span className="w-3 h-3 rounded-full bg-[#0fbd74]" />
                    <span className="text-xs text-[#8faeb0]">Healthy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-[#8faeb0]">Stressed</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={data.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#8faeb0" fontSize={12} />
                  <YAxis stroke="#8faeb0" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#152e24', border: '1px solid rgba(15,189,116,0.2)', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="healthy" fill="#0fbd74" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stressed" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
                      paddingAngle={2}
                      dataKey="value"
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
              <h2 className="text-lg font-bold text-white">Recent Field Analyses</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm text-[#8faeb0] hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Filter</button>
                <button className="px-3 py-1.5 text-sm text-[#8faeb0] hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c3b2f]/50 border-b border-white/5 text-xs uppercase tracking-wider text-[#8faeb0] font-semibold">
                    <th className="px-6 py-4">Farm Name</th>
                    <th className="px-6 py-4">Analysis Date</th>
                    <th className="px-6 py-4">Crop Type</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockRecent.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${row.iconBg} flex items-center justify-center ${row.iconColor}`}>
                            <span className="material-icons-round text-sm">{row.icon}</span>
                          </div>
                          <span className="font-medium text-gray-200">{row.farm_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{row.date} <span className="text-xs ml-1 opacity-50">{row.time}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-300">{row.crop}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${row.confidence >= 90 ? 'bg-[#0fbd74]' : 'bg-yellow-500'}`}
                              style={{ width: `${row.confidence}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${row.confidence >= 90 ? 'text-[#0fbd74]' : 'text-yellow-500'}`}>{row.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{statusBadge(row.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/results/${row.id}`)}
                          className="text-sm text-[#0fbd74] hover:text-[#0ca665] font-medium"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

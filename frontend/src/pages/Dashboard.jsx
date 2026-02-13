import React, { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../api/client'
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

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">{error}</div>

  const mockData = dashboardData || {
    total_analyses: 127,
    healthy_count: 89,
    stressed_count: 38,
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Crop Health Dashboard</h1>
        <p>Overview of all analyses and crop health metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon total">
            <BarChart3 size={28} />
          </div>
          <div className="kpi-content">
            <h3>Total Analyses</h3>
            <p className="kpi-value">{mockData.total_analyses}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon healthy">
            <CheckCircle2 size={28} />
          </div>
          <div className="kpi-content">
            <h3>Healthy Crops</h3>
            <p className="kpi-value">{mockData.healthy_count}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon stressed">
            <AlertCircle size={28} />
          </div>
          <div className="kpi-content">
            <h3>Stressed Crops</h3>
            <p className="kpi-value">{mockData.stressed_count}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon confidence">
            <TrendingUp size={28} />
          </div>
          <div className="kpi-content">
            <h3>Avg Confidence</h3>
            <p className="kpi-value">{mockData.avg_confidence}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Analysis Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.trend_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="healthy" fill="#10b981" name="Healthy" />
              <Bar dataKey="stressed" fill="#ef4444" name="Stressed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Health Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={healthStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {healthStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

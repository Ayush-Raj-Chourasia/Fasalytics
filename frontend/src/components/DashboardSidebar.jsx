import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LayoutDashboard, FlaskConical, History, Home, Menu, X, Bell, Settings, HelpCircle } from 'lucide-react'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analyze', label: 'Analyze', icon: FlaskConical },
    { path: '/history', label: 'History', icon: History },
]

function DashboardSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(path)
    }

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="sidebar-logo-area">
                <Link to="/" className="sidebar-logo-link">
                    <div className="sidebar-logo-icon">
                        <Leaf size={18} color="white" />
                    </div>
                    <span className="sidebar-logo-text">Fasalytics</span>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="sidebar-nav">
                <p className="sidebar-section-label">Main</p>
                {navItems.map(({ path, label, icon: Icon }) => (
                    <button
                        key={path}
                        onClick={() => { navigate(path); setMobileOpen(false) }}
                        className={`sidebar-nav-btn ${isActive(path) ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </button>
                ))}

                <button className="sidebar-nav-btn">
                    <Bell size={20} />
                    <span>Alerts</span>
                    <span className="sidebar-badge">3</span>
                </button>

                <p className="sidebar-section-label" style={{ marginTop: 24 }}>System</p>
                <button className="sidebar-nav-btn">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
                <button className="sidebar-nav-btn">
                    <HelpCircle size={20} />
                    <span>Support</span>
                </button>
            </nav>

            {/* Back to Home */}
            <div className="sidebar-footer">
                <button
                    onClick={() => { navigate('/'); setMobileOpen(false) }}
                    className="sidebar-nav-btn sidebar-home-btn"
                >
                    <Home size={20} />
                    <span>Back to Home</span>
                </button>
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">A</div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">Dr. A. Sharma</p>
                        <p className="sidebar-user-role">Senior Agronomist</p>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle sidebar"
            >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
                {sidebarContent}
            </aside>
        </>
    )
}

export default DashboardSidebar

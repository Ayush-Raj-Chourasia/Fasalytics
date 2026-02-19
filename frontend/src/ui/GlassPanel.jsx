import React from 'react'

/**
 * GlassPanel — Frosted glass effect card with consistent dark theme
 */
export default function GlassPanel({ children, className = '', role = 'region' }) {
  return (
    <div className={`glass-panel ${className}`} role={role}>
      {children}
    </div>
  )
}

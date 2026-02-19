import React from 'react'
import { motion } from 'framer-motion'
import GlassPanel from './GlassPanel'

/**
 * StatCard — KPI card with sparkline (dark theme only)
 */
export default function StatCard({ title, value, trend = 0, sparkline = [], className = '' }) {
  const isPositive = trend >= 0

  return (
    <GlassPanel className={className}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af' }}>
              {title}
            </div>
            <motion.div
              style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {value}
            </motion.div>
          </div>
          <motion.div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '6px',
              background: isPositive ? 'rgba(15, 191, 117, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isPositive ? '#00D28A' : '#f87171'
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {isPositive ? `+${trend}%` : `${trend}%`}
          </motion.div>
        </div>

        {sparkline.length > 1 && (
          <svg viewBox="0 0 80 24" style={{ width: '100%', height: '32px' }} aria-hidden="true">
            <g opacity="0.1" stroke="#6b7280" strokeWidth="0.5">
              <line x1="0" y1="12" x2="80" y2="12" />
            </g>
            <polyline
              fill="none"
              stroke="#00D28A"
              strokeWidth="2"
              points={sparkline
                .map((v, i) => {
                  const x = (i / (sparkline.length - 1)) * 80
                  const y = 24 - (v / 100) * 20 - 2
                  return `${x},${y}`
                })
                .join(' ')}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00D28A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#00D28A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill={`url(#gradient-${title})`}
              points={`0,24 ${sparkline
                .map((v, i) => {
                  const x = (i / (sparkline.length - 1)) * 80
                  const y = 24 - (v / 100) * 20 - 2
                  return `${x},${y}`
                })
                .join(' ')} 80,24`}
            />
          </svg>
        )}
      </div>
    </GlassPanel>
  )
}

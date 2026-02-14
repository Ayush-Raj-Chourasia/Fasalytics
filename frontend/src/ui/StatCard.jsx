import React from 'react'
import { motion } from 'framer-motion'
import GlassPanel from './GlassPanel'

/**
 * StatCard
 * KPI card with count-up animation and mini sparkline
 * @param {string} title - Card title
 * @param {number|string} value - Main value to display
 * @param {number} trend - Trend percentage
 * @param {array} sparkline - Array of numbers for sparkline (0-100 scale)
 * @param {string} className - Additional classes
 */
export default function StatCard({ 
  title, 
  value, 
  trend = 0, 
  sparkline = [],
  className = '' 
}) {
  return (
    <GlassPanel className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </div>
          <motion.div 
            className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {value}
          </motion.div>
        </div>
        <motion.div 
          className={`text-sm font-semibold px-2.5 py-1 rounded ${
            trend >= 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {trend >= 0 ? `+${trend}%` : `${trend}%`}
        </motion.div>
      </div>

      {/* Mini sparkline SVG chart */}
      {sparkline.length > 1 && (
        <svg viewBox="0 0 80 24" className="w-full h-8" aria-hidden="true">
          {/* light grid */}
          <g opacity="0.1" stroke="currentColor" strokeWidth="0.5">
            <line x1="0" y1="12" x2="80" y2="12" />
          </g>
          {/* sparkline polyline */}
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
          {/* area under curve */}
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
    </GlassPanel>
  )
}

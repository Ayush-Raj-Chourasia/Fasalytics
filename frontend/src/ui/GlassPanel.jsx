import React from 'react'
import clsx from 'classnames'

/**
 * GlassPanel
 * Frosted glass effect card with backdrop blur
 * @param {React.ReactNode} children - Content
 * @param {string} className - Additional classes
 * @param {string} role - ARIA role (default: region)
 */
export default function GlassPanel({ children, className = '', role = 'region' }) {
  return (
    <div
      className={clsx(
        'backdrop-blur-md bg-white/60 dark:bg-[#0c1216]/60',
        'border border-white/6 rounded-lg shadow-soft',
        'p-6 will-change-transform', 
        className
      )}
      role={role}
    >
      {children}
    </div>
  )
}

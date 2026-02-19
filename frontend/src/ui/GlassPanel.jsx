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
        'backdrop-blur-xl bg-[#0c1216]/60',
        'border border-[#0fbf75]/15 rounded-2xl',
        'p-6 will-change-transform',
        className
      )}
      role={role}
    >
      {children}
    </div>
  )
}

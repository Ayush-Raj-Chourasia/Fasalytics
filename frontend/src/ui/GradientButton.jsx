import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'classnames'

/**
 * GradientButton
 * Premium gradient button with framer-motion hover/tap animations
 * @param {string} children - Button text
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 * @param {string} ariaLabel - Aria label for accessibility
 */
export default function GradientButton({ children, onClick, className = '', ariaLabel }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16 }}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold',
        'bg-gradient-to-r from-[#0fbf75] via-[#0aa56f] to-[#008f5a] text-white',
        'shadow-soft hover:shadow-elevated transition-shadow',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00d28a]/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}

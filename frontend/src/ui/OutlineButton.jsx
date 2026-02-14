import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'classnames'

/**
 * OutlineButton
 * Secondary outline-style button
 * @param {string} children - Button text
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 * @param {string} ariaLabel - Aria label
 */
export default function OutlineButton({ 
  children, 
  onClick, 
  className = '', 
  ariaLabel 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16 }}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold',
        'border-2 border-current text-gray-900 dark:text-white',
        'bg-white/10 hover:bg-white/20 transition-colors',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}

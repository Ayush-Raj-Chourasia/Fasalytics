import React from 'react'
import { motion } from 'framer-motion'

/**
 * GradientButton — Green gradient button with hover glow effect
 */
export default function GradientButton({ children, onClick, className = '', ariaLabel, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.16 }}
      onClick={onClick}
      disabled={disabled}
      className={`gradient-btn ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}

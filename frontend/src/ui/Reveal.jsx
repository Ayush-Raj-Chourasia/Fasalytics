import React from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

/**
 * Reveal
 * Scroll-triggered reveal animation wrapper
 * @param {React.ReactNode} children - Content to reveal
 * @param {number} threshold - Intersection threshold (0-1), default 0.18
 * @param {number} delay - Animation delay in seconds
 * @param {boolean} triggerOnce - Animate only once
 */
export default function Reveal({ 
  children, 
  threshold = 0.18, 
  delay = 0,
  triggerOnce = true 
}) {
  const [ref, inView] = useInView({ 
    threshold, 
    triggerOnce
  })

  return (
    <div ref={ref} className="will-change-transform">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ 
          duration: 0.42,
          delay,
          ease: [0.22, 0.9, 0.13, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

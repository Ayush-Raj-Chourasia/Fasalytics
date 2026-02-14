import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GradientButton from './GradientButton'
import GlassPanel from './GlassPanel'

/**
 * HeroParallax
 * Premium hero section with three-layer parallax scrolling
 * - Background gradient layer (translateY * 0.12)
 * - Midground glyph/glow (translateY * 0.22)
 * - Foreground content (translateY * 0.35)
 * Respects prefers-reduced-motion
 */
export default function HeroParallax() {
  const [scrollY, setScrollY] = useState(0)
  const shouldReduce = useReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    if (shouldReduce) return

    const onScroll = () => {
      setScrollY(window.scrollY || window.pageYOffset)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [shouldReduce])

  // Clamp function to prevent excessive transforms
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

  const bgTranslate = shouldReduce ? 0 : clamp(scrollY * 0.12, -60, 100)
  const midTranslate = shouldReduce ? 0 : clamp(scrollY * 0.22, -100, 180)
  const fgTranslate = shouldReduce ? 0 : clamp(scrollY * 0.35, -120, 220)

  return (
    <header className="relative overflow-hidden" role="banner">
      {/* BACKGROUND LAYER - Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${bgTranslate}px)`,
          background:
            'linear-gradient(90deg, #0fbf75 0%, #0aa56f 50%, #008f5a 100%)',
          filter: 'saturate(1.05)',
        }}
      />

      {/* MIDGROUND - Decorative Glow */}
      <motion.div
        style={{ transform: `translateY(${midTranslate}px)` }}
        className="absolute right-12 top-8 opacity-25"
        aria-hidden="true"
      >
        {/* Circular gradient glow */}
        <div className="w-80 h-80 rounded-full bg-white/12 blur-3xl" />
      </motion.div>

      {/* FOREGROUND CONTENT */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 0.9, 0.13, 1] }}
            style={{ transform: `translateY(${fgTranslate}px)` }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              AI-Powered Crop Health Monitoring
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/90 max-w-lg leading-relaxed">
              Protect your harvest with advanced ML models, real-time sensor analytics, and 
              intelligent field zone mapping — actionable insights for farmers and researchers.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <GradientButton
                onClick={() => navigate('/analyze')}
                ariaLabel="Start analyzing your crops now"
              >
                <span>Start Analyzing</span>
                <span aria-hidden="true">→</span>
              </GradientButton>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                aria-label="View live analytics dashboard"
                className="px-5 py-3 rounded-lg border border-white/20 bg-white/8 text-white font-semibold 
                  hover:bg-white/12 transition-colors
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                View Dashboard
              </motion.button>
            </div>

            {/* Mini Stats */}
            <div className="mt-8 flex flex-wrap gap-3">
              <GlassPanel className="inline-flex items-center gap-3 px-4 py-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Analyses
                </div>
                <motion.div 
                  className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  1,248+
                </motion.div>
              </GlassPanel>
              <GlassPanel className="inline-flex items-center gap-3 px-4 py-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Avg Confidence
                </div>
                <motion.div 
                  className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  87%
                </motion.div>
              </GlassPanel>
            </div>
          </motion.div>

          {/* Right: Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.9, 0.13, 1] }}
            style={{ transform: `translateY(${fgTranslate * 0.6}px)` }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm">
              <GlassPanel className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Live Field Overview
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {/* Mini Chart Placeholder */}
                <div className="h-32 sm:h-40 bg-gradient-to-br from-green-100/20 to-green-50/10 dark:from-green-900/20 dark:to-green-950/10 rounded-lg mb-5 flex items-center justify-center">
                  <p className="text-xs text-gray-400">Live chart data</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white/40 dark:bg-white/5 rounded-md">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Healthy</div>
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">62%</div>
                  </div>
                  <div className="text-center p-2 bg-white/40 dark:bg-white/5 rounded-md">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Stressed</div>
                    <div className="font-bold text-lg text-amber-600 dark:text-amber-400">28%</div>
                  </div>
                  <div className="text-center p-2 bg-white/40 dark:bg-white/5 rounded-md">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Unknown</div>
                    <div className="font-bold text-lg text-gray-600 dark:text-gray-400">10%</div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative spacer */}
      <div className="h-16 lg:h-24" aria-hidden="true" />
    </header>
  )
}

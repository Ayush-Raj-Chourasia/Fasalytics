import React from 'react'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0fbf75] border-r-[#0aa56f]" />
        </motion.div>

        {/* Leaf Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf className="text-[#008f5a]" size={32} />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Loading
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Analyzing your crop health...
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-32"
        >
          <motion.div
            animate={{ x: [-128, 128] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-full w-16 bg-gradient-to-r from-[#0fbf75] to-[#008f5a] rounded-full"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingSpinner

import React from 'react'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0F1724'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'relative', width: '64px', height: '64px' }}
        >
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '4px solid #1a2332'
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '4px solid transparent',
            borderTopColor: '#0fbf75', borderRightColor: '#00D28A'
          }} />
        </motion.div>

        {/* Leaf */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf style={{ color: '#0fbf75' }} size={32} />
        </motion.div>

        {/* Text */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Loading</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Analyzing your crop health...
          </p>
        </motion.div>

        {/* Progress */}
        <div style={{
          height: '4px', background: '#1a2332', borderRadius: '9999px',
          overflow: 'hidden', width: '128px'
        }}>
          <motion.div
            animate={{ x: [-128, 128] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              height: '100%', width: '64px', borderRadius: '9999px',
              background: 'linear-gradient(90deg, #0fbf75, #00D28A)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner

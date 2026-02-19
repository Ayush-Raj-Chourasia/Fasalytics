import React from 'react'

/**
 * SkeletonCard — Dark theme loading placeholder
 */
export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-panel ${className}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '16px', background: 'linear-gradient(90deg, #1a2332, #0a0f1a)', borderRadius: '6px', width: '75%' }} className="animate-pulse" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ height: '12px', background: 'linear-gradient(90deg, #1a2332, #0a0f1a)', borderRadius: '6px', width: '100%' }} className="animate-pulse" />
          <div style={{ height: '12px', background: 'linear-gradient(90deg, #1a2332, #0a0f1a)', borderRadius: '6px', width: '83%' }} className="animate-pulse" />
          <div style={{ height: '12px', background: 'linear-gradient(90deg, #1a2332, #0a0f1a)', borderRadius: '6px', width: '66%' }} className="animate-pulse" />
        </div>
        <div style={{ height: '128px', background: 'linear-gradient(90deg, #1a2332, #0a0f1a)', borderRadius: '8px', marginTop: '8px' }} className="animate-pulse" />
      </div>
    </div>
  )
}

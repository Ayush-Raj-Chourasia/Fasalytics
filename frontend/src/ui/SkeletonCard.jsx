import React from 'react'
import clsx from 'classnames'

/**
 * SkeletonCard
 * Animated loading placeholder
 * @param {string} className - Additional classes
 */
export default function SkeletonCard({ className = '' }) {
  return (
    <div className={clsx('rounded-lg overflow-hidden', className)}>
      <div className="space-y-4 p-6">
        {/* Header line */}
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded w-3/4 animate-pulse" />
        
        {/* Three content lines */}
        <div className="space-y-3">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded w-full animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded w-4/6 animate-pulse" />
        </div>
        
        {/* Chart area */}
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded mt-4 animate-pulse" />
      </div>
    </div>
  )
}

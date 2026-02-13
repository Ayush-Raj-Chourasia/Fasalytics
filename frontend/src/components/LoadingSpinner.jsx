import React from 'react'
import '../styles/spinner.css'

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

export default LoadingSpinner

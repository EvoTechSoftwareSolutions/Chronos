import React from 'react'
import './ScrollToTopButton.css'

const ScrollToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="scroll-to-top-wrapper">
      <button
        className="scroll-to-top-btn"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        id="scroll-to-top-button"
      >
        <svg
          className="scroll-arrow-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  )
}

export default ScrollToTopButton

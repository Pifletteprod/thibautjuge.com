'use client'

import { useEffect, useState } from 'react'

export default function ProcessProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const section = document.querySelector('.process-steps')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const current = window.innerHeight / 2 - rect.top
      setProgress(Math.min(1, Math.max(0, current / rect.height)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="process-progress-track">
      <div className="process-progress-fill" style={{ height: `${progress * 100}%` }} />
    </div>
  )
}

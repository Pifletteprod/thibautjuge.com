'use client'

import { useEffect, useRef } from 'react'

export default function HeroBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = spotlightRef.current
    if (!el) return

    let pressed = false

    function onMouseMove(e: MouseEvent) {
      if (!pressed) return
      el!.style.setProperty('--mx', `${e.clientX}px`)
      el!.style.setProperty('--my', `${e.clientY}px`)
    }
    function onMouseDown(e: MouseEvent) {
      pressed = true
      el!.style.setProperty('--mx', `${e.clientX}px`)
      el!.style.setProperty('--my', `${e.clientY}px`)
      el!.style.opacity = '0.35'
    }
    function onMouseUp() {
      pressed = false
      el!.style.opacity = '0'
    }

    el.style.opacity = '0'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Image filigrane — toujours visible très discrètement */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/capitole.jpg)',
          filter: 'grayscale(100%)',
          opacity: 0.03,
        }}
      />

    </div>
  )
}

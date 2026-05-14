'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const FluidEffect = dynamic(() => import('./FluidEffect'), { ssr: false })

export default function FluidEffectLazy() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const activate = () => setActive(true)
    window.addEventListener('mousemove', activate, { once: true })
    window.addEventListener('touchstart', activate, { once: true })
    return () => {
      window.removeEventListener('mousemove', activate)
      window.removeEventListener('touchstart', activate)
    }
  }, [])

  return active ? <FluidEffect /> : null
}

'use client'

import dynamic from 'next/dynamic'

const FluidEffect = dynamic(() => import('./FluidEffect'), { ssr: false })

export default function FluidEffectLazy() {
  return <FluidEffect />
}

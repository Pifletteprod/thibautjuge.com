'use client'

import { usePathname } from 'next/navigation'

export default function BackgroundCapitole() {
  const pathname = usePathname()
  if (/^\/portfolio\/.+/.test(pathname)) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -2,
      backgroundImage: 'url(/images/capitole.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: 0.05,
      pointerEvents: 'none',
    }} />
  )
}

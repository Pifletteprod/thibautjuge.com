'use client'

import { usePathname } from 'next/navigation'

export default function BackgroundCapitole() {
  const pathname = usePathname()
  if (/^\/portfolio\/.+/.test(pathname)) return null

  return <div className="bg-capitole" />
}

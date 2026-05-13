'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

type Page = { label: string; path: string }

export default function NavBandeau({ pages }: { pages: Page[] }) {
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onTouchStart() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    setPaused(true)
  }

  function onTouchEnd() {
    resumeTimer.current = setTimeout(() => setPaused(false), 2000)
  }

  const links = [...pages, ...pages]

  return (
    <div className="nav-bandeau-wrapper" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="nav-bandeau-track" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
        {links.map((page, i) => (
          <Link key={i} href={page.path} className="nav-link">
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

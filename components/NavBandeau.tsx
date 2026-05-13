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
    <div
      style={{ overflow: 'hidden', width: '100%' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        width: 'max-content',
        animation: 'nav-marquee 18s linear infinite',
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {links.map((page, i) => (
          <Link
            key={i}
            href={page.path}
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

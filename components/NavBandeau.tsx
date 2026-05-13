'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'

type Page = { label: string; path: string }

export default function NavBandeau({ pages }: { pages: Page[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const touching = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pos = useRef(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    function tick() {
      if (!touching.current && el) {
        pos.current += 0.3
        el.scrollLeft = Math.round(pos.current)
        if (pos.current >= el.scrollWidth / 2) {
          pos.current = 0
          el.scrollLeft = 0
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  function onTouchStart() {
    touching.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  function onTouchEnd() {
    resumeTimer.current = setTimeout(() => { touching.current = false }, 2000)
  }

  const links = [...pages, ...pages]

  return (
    <div
      ref={wrapperRef}
      className="nav-bandeau-wrapper"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="nav-bandeau-track">
        {links.map((page, i) => (
          <Link key={i} href={page.path} className="nav-link">
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

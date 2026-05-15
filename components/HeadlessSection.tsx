'use client'

import { useRef } from 'react'

const BUBBLES = [
    {
    q: "C'est quoi un site headless, concrètement ?",
    r: "WordPress gère le contenu en coulisses, Next.js affiche un site ultra-rapide aux visiteurs. Vous gardez la facilité de WordPress, vos visiteurs gagnent une vitesse premium.",
  },
  {
    q: "WordPress en 2026, ce n'est pas dépassé ?",
    r: "Pas du tout. Couplé à Next.js en headless, WordPress devient jusqu'à 10x plus rapide et infiniment plus moderne, tout en gardant son admin facile.",
  },

  {
    q: "Pourquoi mes concurrents ne le font pas encore ?",
    r: "Le headless demande une double compétence rare : maîtrise de WordPress et de Next.js. C'est précisément ce double profil que je propose depuis Toulouse.",
  },
  {
    q: "Quel impact sur mon référencement Google ?",
    r: "Énorme. Un site headless coche tous les critères de performance Google (Core Web Vitals), ce qui se traduit par un meilleur classement et plus de conversions.",
  },
  {
    q: "Et pour ChatGPT et les autres IA ?",
    r: "Le headless permet une optimisation GEO native : données structurées propres, contenu bien hiérarchisé, ce qui multiplie vos chances d'être cité par ChatGPT et Perplexity.",
  },
]

const INITIAL_POSITIONS = [
  { x: 40,  y: 50  },
  { x: 630, y: 65  },
  { x: 295, y: 265 },
  { x: 55,  y: 385 },
  { x: 615, y: 355 },
]

const INITIAL_VELOCITIES = [
  { vx:  0.25, vy:  0.18 },
  { vx: -0.22, vy:  0.28 },
  { vx:  0.30, vy: -0.20 },
  { vx: -0.28, vy: -0.24 },
  { vx:  0.20, vy:  0.32 },
]


export default function HeadlessSection() {
  const arenaRef    = useRef<HTMLDivElement>(null)
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([])
  const physics = useRef(
    BUBBLES.map((_, i) => ({
      x: INITIAL_POSITIONS[i].x,
      y: INITIAL_POSITIONS[i].y,
      vx: INITIAL_VELOCITIES[i].vx,
      vy: INITIAL_VELOCITIES[i].vy,
      pinned: false,
      dragging: false,
    }))
  )

  const drag     = useRef({ idx: -1, ox: 0, oy: 0 })
  const lastMoved = useRef(false)
  const lastPos   = useRef<{ x: number; y: number; t: number }[]>([])


  const handleMouseDown = (e: React.MouseEvent, i: number) => {
    e.preventDefault()
    const p = physics.current[i]
    drag.current  = { idx: i, ox: e.clientX - p.x, oy: e.clientY - p.y }
    physics.current[i].dragging = true
    lastMoved.current = false
    lastPos.current   = []
    wrapperRefs.current[i]?.classList.add('is-dragging')

    const onMove = (e: MouseEvent) => {
      const { idx, ox, oy } = drag.current
      if (idx === -1) return
      const p    = physics.current[idx]
      const arena = arenaRef.current
      const el   = wrapperRefs.current[idx]
      const maxX = arena ? arena.clientWidth  - (el?.offsetWidth  ?? 260) : 9999
      const maxY = arena ? arena.clientHeight - (el?.offsetHeight ?? 160) : 9999
      const newX = Math.max(0, Math.min(maxX, e.clientX - ox))
      const newY = Math.max(0, Math.min(maxY, e.clientY - oy))
      if (Math.abs(newX - p.x) + Math.abs(newY - p.y) > 3) lastMoved.current = true
      p.x = newX
      p.y = newY
      const now = performance.now()
      lastPos.current.push({ x: newX, y: newY, t: now })
      if (lastPos.current.length > 4) lastPos.current.shift()
      if (el) { el.style.left = newX + 'px'; el.style.top = newY + 'px' }
    }

    const onUp = () => {
      const { idx } = drag.current
      if (idx !== -1) {
        const positions = lastPos.current
        if (lastMoved.current && positions.length >= 2) {
          const last = positions[positions.length - 1]
          const prev = positions[positions.length - 2]
          const dt   = Math.max(1, (last.t - prev.t) / 16.67)
          const MAX  = 3
          physics.current[idx].vx = Math.max(-MAX, Math.min(MAX, (last.x - prev.x) / dt))
          physics.current[idx].vy = Math.max(-MAX, Math.min(MAX, (last.y - prev.y) / dt))
        }
        physics.current[idx].dragging = false
        wrapperRefs.current[idx]?.classList.remove('is-dragging')
      }
      drag.current    = { idx: -1, ox: 0, oy: 0 }
      lastPos.current = []
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleClick = (i: number) => {
    if (lastMoved.current) return
    physics.current[i].pinned = true
    const el = wrapperRefs.current[i]
    if (!el) return
    el.querySelector('.headless-bubble')?.classList.add('is-pinned')
    wrapperRefs.current.forEach((w, j) => { if (w) w.style.zIndex = j === i ? '10' : '1' })
  }

  return (
    <section className="headless-section">
      <div className="headless-header">
        <h2 className="section-title">Headless WordPress</h2>
        <h3 className="headless-subtitle">Une nouvelle stack ultra rapide</h3>
      </div>
      <div className="headless-arena" ref={arenaRef}>
        {BUBBLES.map((bubble, i) => (
          <div
            key={i}
            ref={(el: HTMLDivElement | null) => { wrapperRefs.current[i] = el }}
            className="bubble-wrapper bubble-in"
            style={{ left: INITIAL_POSITIONS[i].x, top: INITIAL_POSITIONS[i].y }}
            onMouseDown={e => handleMouseDown(e, i)}
          >
            <div
              className="headless-bubble"
              onClick={() => handleClick(i)}
            >
              <p className="bubble-q">{bubble.q}</p>
              <p className="bubble-r">{bubble.r}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

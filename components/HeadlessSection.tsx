'use client'

import { useRef, useEffect } from 'react'

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

// Card ciblée par la démo "drag" au scroll (la card centrale).
const DEMO_IDX = 2


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

  const cursorRef  = useRef<HTMLDivElement>(null)
  const demoApiRef = useRef<{ cancel: () => void } | null>(null)


  const handleMouseDown = (e: React.MouseEvent, i: number) => {
    // L'utilisateur prend la main : on coupe la démo automatique si elle tourne.
    demoApiRef.current?.cancel()
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

  // Démo "drag" : au scroll, un faux curseur vient saisir une card et la déplace,
  // pour montrer que les bulles sont manipulables. Ne touche jamais la vraie souris.
  useEffect(() => {
    const arena  = arenaRef.current
    const cursor = cursorRef.current
    if (!arena || !cursor) return
    // Desktop only (sous 1024px l'arène est une colonne statique) + accessibilité.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    let cancelled = false
    let rafId = 0
    let played = false

    const cleanup = () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      cursor.classList.remove('is-visible', 'is-grabbing')
      wrapperRefs.current[DEMO_IDX]?.classList.remove('is-dragging')
    }
    demoApiRef.current = { cancel: cleanup }

    const easeOut   = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    // Anime une valeur normalisée 0→1 via requestAnimationFrame, annulable.
    const animate = (duration: number, ease: (t: number) => number, onUpdate: (e: number) => void) =>
      new Promise<void>(resolve => {
        const t0 = performance.now()
        const step = (now: number) => {
          if (cancelled) return resolve()
          const p = Math.min(1, (now - t0) / duration)
          onUpdate(ease(p))
          if (p < 1) rafId = requestAnimationFrame(step)
          else resolve()
        }
        rafId = requestAnimationFrame(step)
      })

    const wait = (ms: number) => animate(ms, t => t, () => {})
    const setCursor = (x: number, y: number) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`
    }

    const runDemo = async () => {
      if (played) return
      played = true
      const el = wrapperRefs.current[DEMO_IDX]
      const p  = physics.current[DEMO_IDX]
      if (!el) return

      const cardW = el.offsetWidth  || 240
      const cardH = el.offsetHeight || 160
      const maxX  = Math.max(0, arena.clientWidth  - cardW)
      const maxY  = Math.max(0, arena.clientHeight - cardH)
      const off   = 34 // décalage du curseur par rapport au coin de la card

      const grabX  = p.x + off
      const grabY  = p.y + off
      const startX = Math.min(maxX + cardW, grabX + 150)
      const startY = Math.min(arena.clientHeight - 16, grabY + cardH + 90)
      const destX  = Math.max(0, Math.min(maxX, p.x - 150))
      const destY  = Math.max(0, Math.min(maxY, p.y - 110))

      setCursor(startX, startY)
      cursor.classList.add('is-visible')

      // 1. Approche
      await animate(720, easeOut, t =>
        setCursor(startX + (grabX - startX) * t, startY + (grabY - startY) * t))
      if (cancelled) return

      // 2. Grab
      el.classList.add('is-dragging')
      cursor.classList.add('is-grabbing')
      await wait(190)
      if (cancelled) return

      // 3. Déplacement card + curseur (on garde physics en phase pour un drag réel ensuite)
      const c0x = p.x, c0y = p.y
      await animate(980, easeInOut, t => {
        const nx = c0x + (destX - c0x) * t
        const ny = c0y + (destY - c0y) * t
        el.style.left = nx + 'px'
        el.style.top  = ny + 'px'
        p.x = nx; p.y = ny
        setCursor(nx + off, ny + off)
      })
      if (cancelled) return

      // 4. Relâche
      el.classList.remove('is-dragging')
      cursor.classList.remove('is-grabbing')
      await wait(170)
      if (cancelled) return

      // 5. Sortie + fondu
      const lx = destX + off, ly = destY + off
      cursor.classList.remove('is-visible')
      await animate(560, easeOut, t => setCursor(lx + 70 * t, ly + 120 * t))
    }

    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.disconnect()
          runDemo()
        }
      }
    }, { threshold: 0.4 })
    io.observe(arena)

    const onUserInteract = () => cleanup()
    arena.addEventListener('pointerdown', onUserInteract)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      io.disconnect()
      arena.removeEventListener('pointerdown', onUserInteract)
      demoApiRef.current = null
    }
  }, [])

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

        <div className="headless-demo-cursor" ref={cursorRef} aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 2.5 L5 19 L9.2 14.8 L12.1 21 L14.6 19.9 L11.7 13.9 L17.6 13.7 Z"
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

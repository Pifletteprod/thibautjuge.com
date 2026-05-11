'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  radius: number
  rotation: number
  rotSpeed: number
  turbX: number
  turbY: number
}

export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const rafRef    = useRef<number>(0)
  const isPressed = useRef(false)
  const mousePos  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawn(x: number, y: number, count = 5) {
      for (let i = 0; i < count; i++) {
        const life = 80 + Math.random() * 60
        particles.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.4 + Math.random() * 0.8),
          life,
          maxLife: life,
          radius: 8 + Math.random() * 12,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          turbX: (Math.random() - 0.5) * 0.1,
          turbY: (Math.random() - 0.5) * 0.05,
        })
      }
    }

    function onMouseDown(e: MouseEvent) {
      isPressed.current = true
      mousePos.current  = { x: e.clientX, y: e.clientY }
      spawn(e.clientX, e.clientY, 12)
    }
    function onMouseMove(e: MouseEvent) {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    function onMouseUp() { isPressed.current = false }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    function drawSmokeParticle(p: Particle) {
      const t     = p.life / p.maxLife
      const alpha = t < 0.15 ? (t / 0.15) * 0.25 : 0.25
      const r     = p.radius * (1 + (1 - t) * 2.5) // grandit avec le temps

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      grad.addColorStop(0,   `rgba(220, 220, 220, ${alpha})`)
      grad.addColorStop(0.4, `rgba(180, 180, 180, ${alpha * 0.5})`)
      grad.addColorStop(1,   `rgba(120, 120, 120, 0)`)

      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn en continu si clic maintenu
      if (isPressed.current) {
        spawn(
          mousePos.current.x + (Math.random() - 0.5) * 10,
          mousePos.current.y + (Math.random() - 0.5) * 10,
          3
        )
      }

      particles.current = particles.current.filter(p => p.life > 0)

      for (const p of particles.current) {
        // Turbulence aléatoire
        p.turbX += (Math.random() - 0.5) * 0.06
        p.turbY += (Math.random() - 0.5) * 0.03
        p.turbX *= 0.97
        p.turbY *= 0.97

        p.vx += p.turbX
        p.vy += p.turbY
        p.vx *= 0.98
        p.vy *= 0.98

        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.life--

        drawSmokeParticle(p)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

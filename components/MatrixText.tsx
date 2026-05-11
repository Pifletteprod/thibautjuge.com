'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}|/\\!?=+~^°§€ΦΨΩλπΣ'

function useMatrixReveal(text: string, active: boolean) {
  const [display, setDisplay] = useState('')
  const frameRef = useRef(0)

  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = text.length * 2 // 2 frames par caractère

    function tick() {
      frame++
      const revealed = Math.floor(frame / 2)
      let result = ''
      for (let i = 0; i < text.length; i++) {
        if (i < revealed) {
          result += text[i]
        } else if (i === revealed) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }
      setDisplay(result)
      if (frame < total) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [text, active])

  return display
}

export default function MatrixText({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!phrases.length) return
    const duration = 3500 // durée d'affichage de chaque phrase
    const timer = setInterval(() => {
      setActive(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % phrases.length)
        setActive(true)
      }, 200)
    }, duration)
    return () => clearInterval(timer)
  }, [phrases])

  const text   = phrases[index] ?? ''
  const display = useMatrixReveal(text, active)

  if (!phrases.length) return null

  return (
    <p style={{
      fontFamily:    'var(--font-orbitron)',
      fontSize:      'clamp(0.65rem, 1vw, 0.9rem)',
      fontWeight:    400,
      textTransform: 'uppercase',
      color:         'rgba(255,255,255,0.55)',
      letterSpacing: '0.15em',
      marginTop:     '1rem',
      minHeight:     '1.4em',
    }}>
      {display}
    </p>
  )
}

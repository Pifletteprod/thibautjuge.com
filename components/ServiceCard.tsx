'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  title: string
  slug: string
}

export default function ServiceCard({ title, slug }: Props) {
  const [gradient, setGradient] = useState('rgba(255,255,255,0.95)')

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGradient(
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,1) 0%, rgba(235,235,235,0.95) 60%, rgba(210,210,210,0.92) 100%)`
    )
  }

  function onMouseLeave() {
    setGradient('linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(220,230,240,0.92) 100%)')
  }

  return (
    <Link
      href={`/services/${slug}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
        background: gradient,
        textDecoration: 'none',
        borderTop: '2px solid rgba(255,255,255,1)',
        borderLeft: '1px solid rgba(200,210,220,0.5)',
        transition: 'background 0.15s ease',
      }}
    >
      <h3 style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: '#0a0a0a',
        margin: 0,
      }}>
        {title}
      </h3>
    </Link>
  )
}

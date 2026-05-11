'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  title: string
  slug: string
}

export default function ServiceCard({ title, slug }: Props) {
  const [gradient, setGradient] = useState('transparent')

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGradient(
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 60%, rgba(255,255,255,0.04) 100%)`
    )
  }

  function onMouseLeave() {
    setGradient('transparent')
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
        borderTop: '2px solid rgba(255,255,255,0.3)',
        borderLeft: '2px solid rgba(255,255,255,0.1)',
        transition: 'background 0.15s ease',
      }}
    >
      <h3 style={{
        fontSize: '.9rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: 'black',
        margin: 0,
      }}>
        {title}
      </h3>
    </Link>
  )
}

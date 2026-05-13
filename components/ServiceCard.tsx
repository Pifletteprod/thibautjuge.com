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
      className="service-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ background: gradient }}
    >
      <h3 className="service-card-title">{title}</h3>
    </Link>
  )
}

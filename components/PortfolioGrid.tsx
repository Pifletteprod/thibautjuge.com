'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type Projet = {
  slug: string
  title: string
  projetLien: string
  imageUrl: string
  altText: string
  description?: string
}

function PortfolioRow({ projets }: { projets: Projet[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const cols = Array.from({ length: projets.length }, (_, col) => {
    if (hovered === null) return '1fr'
    return hovered === col ? '1.3fr' : '0.85fr'
  }).join(' ')

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols,
      gap: '1rem',
      transition: 'grid-template-columns 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
    }}>
      {projets.map((projet, i) => {
        const isHovered = hovered === i

        return (
          <Link
            key={projet.slug}
            href={`/portfolio/${projet.slug}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'block',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              overflow: 'hidden',
              padding: '1rem',
              boxShadow: isHovered ? '0 24px 48px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'box-shadow 0.4s ease',
            }}
          >
            {projet.imageUrl && (
              <Image
                src={projet.imageUrl}
                alt={projet.altText || projet.title}
                width={800}
                height={600}
                sizes="33vw"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '12px',
                  transition: 'transform 0.4s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            )}
            <div style={{ padding: '0.8rem 0.2rem 0' }}>
              <h3 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'white',
                margin: '0 0 0.4rem',
              }}>
                {projet.title}
              </h3>
              {projet.description && (
                <p style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.45)',
                  margin: '0.3rem 0 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {projet.description.slice(0, 150)}
                </p>
              )}
              {projet.projetLien && (
                <p style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.4)',
                  margin: '0.3rem 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {projet.projetLien.replace(/^https?:\/\//, '')}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function PortfolioGrid({ projets }: { projets: Projet[] }) {
  const rows: Projet[][] = []
  for (let i = 0; i < projets.length; i += 3) {
    rows.push(projets.slice(i, i + 3))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
      {rows.map((row, i) => (
        <PortfolioRow key={i} projets={row} />
      ))}
    </div>
  )
}

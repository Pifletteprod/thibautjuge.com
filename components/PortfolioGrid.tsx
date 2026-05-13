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
    <div className="portfolio-row" style={{ '--cols': cols } as React.CSSProperties}>
      {projets.map((projet, i) => {
        const isHovered = hovered === i

        return (
          <Link
            key={projet.slug}
            href={`/portfolio/${projet.slug}`}
            className="portfolio-card"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              boxShadow: isHovered ? '0 24px 48px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {projet.imageUrl && (
              <Image
                src={projet.imageUrl}
                alt={projet.altText || projet.title}
                width={800}
                height={600}
                sizes="33vw"
                className="portfolio-card-image"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
              />
            )}
            <div className="portfolio-card-body">
              <h3 className="portfolio-card-title">{projet.title}</h3>
              {projet.description && (
                <p className="portfolio-card-desc">
                  {projet.description.slice(0, 150)}
                </p>
              )}
              {projet.projetLien && (
                <p className="portfolio-card-url">
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
    <div className="portfolio-grid">
      {rows.map((row, i) => (
        <PortfolioRow key={i} projets={row} />
      ))}
    </div>
  )
}

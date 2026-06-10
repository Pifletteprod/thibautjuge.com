import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'
import RichContent from '@/components/RichContent'
import { decodeHtml } from '@/lib/decodeHtml'

const GET_A_PROPOS = `
  query GetAPropos {
    pageBy(uri: "/a-propos") {
      title
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`

type AProposData = {
  pageBy: {
    title: string
    content: string
    featuredImage: {
      node: {
        sourceUrl: string
        altText: string
      }
    } | null
  }
}

type Review = {
  authorAttribution: { displayName: string; photoUri: string; uri: string }
  rating: number
  originalText: { text: string }
  relativePublishTimeDescription: string
}

async function getGoogleReviews(): Promise<Review[]> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${process.env.GOOGLE_PLACE_ID}`,
    {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': 'reviews',
      },
      next: { revalidate: 86400 },
    }
  )
  const data = await res.json()
  return data.reviews ?? []
}


const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pifletteproduction',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/thibaut-juge',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/Pifletteprod',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Codeur.com',
    href: 'https://www.codeur.com/-piflettep',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
]

export default async function AProposPage() {
  const [wpData, reviews] = await Promise.all([
    fetchGraphQL<AProposData>(GET_A_PROPOS),
    getGoogleReviews(),
  ])
  const { title, content, featuredImage } = wpData.pageBy

  return (
    <main className="page-main">
      <h1 className="section-title">{title}</h1>

      {/* Bloc principal */}
      <div className="apropos-block">
        {/* Colonne gauche : photo + réseaux */}
        <div className="apropos-aside">
          {featuredImage && (
            <Image
              src={featuredImage.node.sourceUrl}
              alt={featuredImage.node.altText || title}
              width={280}
              height={350}
              priority
              sizes="280px"
              style={{ borderRadius: '12px', display: 'block', width: '100%', height: 'auto', maxWidth: '280px' }}
            />
          )}

          {/* Liens sociaux */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SOCIAL_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'color 0.2s, background 0.2s',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>

          {/* Avis Google */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
                Avis Google
              </div>
              {reviews.map((review, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Image
                      src={review.authorAttribution.photoUri}
                      alt={review.authorAttribution.displayName}
                      width={32}
                      height={32}
                      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.authorAttribution.displayName}
                      </div>
                      <div style={{ color: '#facc15', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                    {review.originalText.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : texte */}
        <div className="apropos-content">
          <RichContent html={decodeHtml(content)} className="projet-content" />
        </div>
      </div>
    </main>
  )
}

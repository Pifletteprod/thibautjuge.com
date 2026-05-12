import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'
import Link from 'next/link'

const GET_PROJET = `
  query GetProjet($slug: ID!) {
    projet(id: $slug, idType: SLUG) {
      title
      portfolio {
        projetDescription
        projetLien
        projetImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

type ProjetData = {
  projet: {
    title: string
    portfolio: {
      projetDescription: string
      projetLien: string
      projetImage: {
        node: {
          sourceUrl: string
          altText: string
        }
      }
    }
  }
}

function injectSwatches(html: string): string {
  return html.replace(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?![^<]*>)/g, (color: string) =>
    `<span style="display:inline-flex;width:100px;height:100px;align-items:flex-end;justify-content:center;padding-bottom:6px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.4);flex-shrink:0;vertical-align:middle;margin-right:15px;">` +
    `<span style="font-size:0.55em;letter-spacing:0.06em;color:rgba(255,255,255,0.85);mix-blend-mode:difference;">${color}</span>` +
    `</span>`
  )
}

function decodeHtml(html: string) {
  return html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fetchGraphQL<ProjetData>(GET_PROJET, { slug })
  const { title, portfolio } = data.projet
  const image = portfolio.projetImage?.node

  return (
    <main>

      {/* Hero full-width */}
      <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(-50vw + 50%)', height: '80vh', overflow: 'hidden' }}>
        {image && (
          <Image
            src={image.sourceUrl}
            alt={image.altText || title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', paddingBottom:'var(--space-xxl)',
        }}>
          <h1 style={{
            fontFamily: 'Futura, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'white',
            margin: 0,
            textAlign: 'center',
          }}>{title}</h1>
          {portfolio.projetLien && (
            <a
              href={portfolio.projetLien}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {portfolio.projetLien.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '4rem 2rem', maxWidth: '760px', margin: '0 auto' }}>
        <Link href="/portfolio" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          ← Portfolio
        </Link>
        {portfolio.projetDescription && (
          <div
            className="projet-content"
            style={{ marginTop: '2rem' }}
            dangerouslySetInnerHTML={{ __html: injectSwatches(decodeHtml(portfolio.projetDescription)) }}
          />
        )}
      </div>

    </main>
  )
}

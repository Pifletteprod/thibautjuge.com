import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'
import Link from 'next/link'
import RichContent from '@/components/RichContent'
import JsonLd from '@/components/JsonLd'
import { decodeHtml } from '@/lib/decodeHtml'
import { buildProjectSchema, buildProjectBreadcrumb } from '@/lib/structured-data'

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
      stackTechs(first: 50) {
        nodes {
          name
          slug
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
    stackTechs: {
      nodes: { name: string; slug: string }[]
    } | null
  }
}

function toPlainText(html: string): string {
  return decodeHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function injectSwatches(html: string): string {
  return html.replace(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?![^<]*>)/g, (color: string) =>
    `<span style="display:inline-flex;width:100px;height:100px;align-items:flex-end;justify-content:center;padding-bottom:6px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.4);flex-shrink:0;vertical-align:middle;margin-right:15px;">` +
    `<span style="font-size:0.55em;letter-spacing:0.06em;color:rgba(255,255,255,0.85);mix-blend-mode:difference;">${color}</span>` +
    `</span>`
  )
}


export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fetchGraphQL<ProjetData>(GET_PROJET, { slug })
  const { title, portfolio } = data.projet
  const image = portfolio.projetImage?.node
  const techs = data.projet.stackTechs?.nodes ?? []

  const uri = `/portfolio/${slug}/`
  const projectSchema = buildProjectSchema({
    title,
    uri,
    description: portfolio.projetDescription ? toPlainText(portfolio.projetDescription).slice(0, 300) : undefined,
    liveUrl: portfolio.projetLien || undefined,
    image: image?.sourceUrl,
    technologies: techs.map(t => t.name),
  })
  const breadcrumbSchema = buildProjectBreadcrumb(title, uri)

  return (
    <main>
      <JsonLd data={projectSchema} />
      <JsonLd data={breadcrumbSchema} />

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

      {/* Contenu + sidebar */}
      <div className="projet-layout">
        <article className="projet-main">
          <Link href="/portfolio" className="projet-back">← Portfolio</Link>
          {portfolio.projetDescription && (
            <RichContent html={injectSwatches(decodeHtml(portfolio.projetDescription))} className="projet-content" />
          )}
        </article>

        {techs.length > 0 && (
          <aside className="projet-sidebar" aria-label="Stack technique">
            <h2 className="projet-sidebar-title">Stack technique</h2>
            <ul className="stack-tags">
              {techs.map(t => (
                <li key={t.slug} className="stack-tag">{t.name}</li>
              ))}
            </ul>
            {portfolio.projetLien && (
              <a
                href={portfolio.projetLien}
                target="_blank"
                rel="noopener noreferrer"
                className="projet-sidebar-link"
              >
                Voir le site →
              </a>
            )}
          </aside>
        )}
      </div>

    </main>
  )
}

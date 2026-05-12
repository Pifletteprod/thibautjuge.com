import { fetchGraphQL } from '@/lib/graphql'
import Link from 'next/link'

const GET_SERVICES = `
  query GetServices {
    services(first: 100) {
      nodes {
        slug
        title
        services {
          serviceTexte
        }
      }
    }
  }
`

type Service = {
  slug: string
  title: string
  services: {
    serviceTexte: string
  } | null
}

type ServiceData = {
  services: {
    nodes: Service[]
  }
}


export default async function ServicesPage() {
  const data = await fetchGraphQL<ServiceData>(GET_SERVICES)
  const services = data.services.nodes

  return (
    <main className="page-main">
      <h1 className="section-title">Services</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '2rem',
      }}>
        {services.map(service => {
          const desc = service.services?.serviceTexte || ''

          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'box-shadow 0.3s ease, background 0.3s ease',
              }}
            >
              <h2 style={{
                fontFamily: 'Futura, sans-serif',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'white',
                margin: 0,
              }}>
                {service.title}
              </h2>
              {desc && (
                <p style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {desc}
                </p>
              )}
              <span style={{
                fontSize: 'clamp(0.65rem, 1vw, 0.8rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.3)',
                marginTop: 'auto',
              }}>
                En savoir plus →
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

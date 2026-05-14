import { fetchGraphQL } from '@/lib/graphql'
import Link from 'next/link'
import ContactForm from '@/app/me-contacter/ContactForm'

const GET_SERVICES = `
  query GetServices {
    services(first: 100) {
      nodes {
        slug
        title
        parent {
          node {
            ... on Service {
              slug
            }
          }
        }
        services {
          serviceTexte
          servicesigle
        }
      }
    }
  }
`

type Service = {
  slug: string
  title: string
  parent: { node: { slug: string } } | null
  services: {
    serviceTexte: string
    servicesigle: string
  } | null
}

type ServiceData = {
  services: {
    nodes: Service[]
  }
}


const SIGLE_COLORS = [
  'rgba(120,190,255,0.22)',
  'rgba(255,200,120,0.20)',
  'rgba(210,160,255,0.22)',
  'rgba(255,160,180,0.20)',
  'rgba(80,220,200,0.20)',
  'rgba(255,230,100,0.20)',
  'rgba(160,255,160,0.20)',
  'rgba(255,140,100,0.20)',
  'rgba(140,200,255,0.22)',
  'rgba(200,140,255,0.22)',
]

function hashColor(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return SIGLE_COLORS[h % SIGLE_COLORS.length]
}

export default async function ServicesPage() {
  const data = await fetchGraphQL<ServiceData>(GET_SERVICES)
  const services = data.services.nodes

  return (
    <main className="page-main">
      <h1 className="section-title">Services</h1>
      <div className="services-grid">
        {services.map((service, i) => {
          const desc   = service.services?.serviceTexte || ''
          const sigle  = service.services?.servicesigle || ''

          return (
            <Link key={service.slug} href={service.parent ? `/services/${service.parent.node.slug}/${service.slug}` : `/services/${service.slug}`} className="service-item">
              {sigle && (
                <span className="service-item-sigle" style={{ '--sigle-color': hashColor(service.slug), '--sigle-delay': `${i * 0.5}s` } as React.CSSProperties}>
                  {sigle}
                </span>
              )}
              <h2 className="service-item-title">{service.title}</h2>
              {desc && <p className="service-item-desc">{desc}</p>}
              <span className="service-item-more">En savoir plus →</span>
            </Link>
          )
        })}
      </div>

      <div className="partner-banner">
        <div className="partner-banner-inner">
          <h2 className="partner-banner-title">Offre partenaire</h2>
          <p className="partner-banner-text">
            Devenez apporteur d&apos;affaire et bénéficiez jusqu&apos;à <strong>10% de commission</strong> pour tout projet signé grâce à vous !
          </p>
        </div>
        <a href="#contact" className="partner-banner-btn">Devenir partenaire</a>
      </div>

      <section id="contact" className="contact">
        <h2 className="section-title">Me contacter</h2>
        <ContactForm />
      </section>
    </main>
  )
}

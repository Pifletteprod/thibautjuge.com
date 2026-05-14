import { fetchGraphQL } from '@/lib/graphql'
import Link from 'next/link'
import ContactForm from '@/app/me-contacter/ContactForm'

const GET_SERVICE = `
  query GetService($slug: ID!) {
    service(id: $slug, idType: URI) {
      title
      parent {
        node {
          ... on Service {
            title
            slug
          }
        }
      }
      services {
        serviceTexte
        serviceDes
      }
    }
  }
`

type ServiceData = {
  service: {
    title: string
    parent: {
      node: {
        title: string
        slug: string
      }
    } | null
    services: {
      serviceTexte: string
      serviceDes: string
    } | null
  }
}

function decodeHtml(html: string) {
  return html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const uri = slug.join('/')
  const data = await fetchGraphQL<ServiceData>(GET_SERVICE, { slug: uri })
  const service = data.service

  return (
    <main className="page-main">
      <nav className="breadcrumb">
        <Link href="/" className="breadcrumb-link">Accueil</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/services" className="breadcrumb-link">Services</Link>
        {service.parent && (
          <>
            <span className="breadcrumb-sep">/</span>
            <Link href={`/services/${service.parent.node.slug}`} className="breadcrumb-link">{service.parent.node.title}</Link>
          </>
        )}
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{service.title}</span>
      </nav>
      <h1 className="page-title">{service.title}</h1>
      {service.services?.serviceDes && (
        <div
          className="projet-content"
          dangerouslySetInnerHTML={{ __html: decodeHtml(service.services.serviceDes) }}
        />
      )}
      <section className="contact">
        <h2 className="section-title">Me contacter</h2>
        <ContactForm />
      </section>
    </main>
  )
}

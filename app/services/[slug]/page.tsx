import { fetchGraphQL } from '@/lib/graphql'

const GET_SERVICE = `
  query GetService($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      title
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

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fetchGraphQL<ServiceData>(GET_SERVICE, { slug })
  const service = data.service

  return (
    <main className="page-main">
      <h1 className="page-title">{service.title}</h1>
      {service.services?.serviceDes && (
        <div
          className="projet-content"
          dangerouslySetInnerHTML={{ __html: decodeHtml(service.services.serviceDes) }}
        />
      )}
    </main>
  )
}

import { fetchGraphQL } from '@/lib/graphql'

const GET_SERVICE = `
  query GetService($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      title
      services {
        serviceTexte
      }
    }
  }
`

type ServiceData = {
  service: {
    title: string
    services: {
      serviceTexte: string
    } | null
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fetchGraphQL<ServiceData>(GET_SERVICE, { slug })

  const service = data.service

  return (
    <main style={{ padding: '8rem 2rem 4rem' }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 4vw, 4rem)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '2rem',
      }}>
        {service.title}
      </h1>
      {service.services?.serviceTexte && (
        <div dangerouslySetInnerHTML={{ __html: service.services.serviceTexte }} />
      )}
    </main>
  )
}

import { fetchGraphQL } from '@/lib/graphql'

const GET_SERVICES = `
  query GetServices {
    services {
      nodes {
        title
        services {
          serviceTexte
        }
      }
    }
  }
`

type Service = {
  title: string
  services: {
    serviceTexte: string
  }
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
    <main>
      <h1>Services</h1>
      <ul>
        {services.map((service) => (
          <li key={service.title}>
            <h2>{service.title}</h2>
            <p>{service.services.serviceTexte}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

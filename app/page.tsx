import { fetchGraphQL } from '@/lib/graphql'
import GeometricPattern from '@/components/GeometricPattern'
import MatrixText from '@/components/MatrixText'
import Image from 'next/image'
import ServiceCard from '@/components/ServiceCard'
import PortfolioGrid from '@/components/PortfolioGrid'
import ContactForm from '@/app/me-contacter/ContactForm'
import ProcessSection from '@/components/ProcessSection'

const GET_HOME_DATA = `
  query GetHomeData {
    generalSettings {
      title
    }
    subtitles(first: 1) {
      nodes {
        heroHomepage {
          subtitles
        }
      }
    }
    services(first: 20) {
      nodes {
        title
        slug
        parentId
        services {
          serviceTexte
        }
      }
    }
    projets(first: 6) {
      nodes {
        slug
        title
        portfolio {
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
  }
`

type HomeData = {
  generalSettings: { title: string }
  subtitles: {
    nodes: {
      heroHomepage: { subtitles: string } | null
    }[]
  }
  services: {
    nodes: {
      title: string
      slug: string
      parentId: string | null
      services: { serviceTexte: string } | null
    }[]
  }
  projets: {
    nodes: {
      slug: string
      title: string
      portfolio: {
        projetLien: string
        projetImage: { node: { sourceUrl: string; altText: string } } | null
      } | null
    }[]
  }
}

export default async function Home() {
  const data = await fetchGraphQL<HomeData>(GET_HOME_DATA)
  const siteTitle = data.generalSettings.title
  const raw = data.subtitles.nodes[0]?.heroHomepage?.subtitles ?? ''
  const subtitles = raw.split('\n').map(s => s.trim()).filter(Boolean)
  const services = data.services.nodes.filter(s => !s.parentId).slice(0, 3)
  const projets = data.projets.nodes.map(p => ({
    slug: p.slug,
    title: p.title,
    projetLien: p.portfolio?.projetLien ?? '',
    imageUrl: p.portfolio?.projetImage?.node.sourceUrl ?? '',
    altText: p.portfolio?.projetImage?.node.altText ?? '',
  }))

  return (
    <main className="home">
      <GeometricPattern />

      <div className="hero-marianne" aria-hidden="true" style={{ position: 'absolute' }}>
        <Image
          src="/images/mariane4.png"
          alt=""
          width={600}
          height={1000}
          priority
          draggable={false}
          style={{ height: '100%', width: 'auto' }}
        />
      </div>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {siteTitle.split(' ').map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </h1>
          <MatrixText phrases={subtitles} />
        </div>
      </section>

      <section className="services-bar">
        {services.map(service => (
          <ServiceCard key={service.slug} title={service.title} slug={service.slug} />
        ))}
      </section>

      <section className="portfolio">
        <h2 className="section-title">Portfolio</h2>
        <PortfolioGrid projets={projets} />
      </section>

      <ProcessSection />

      <section className="contact">
        <h2 className="section-title">Me contacter</h2>
        <ContactForm />
      </section>
    </main>
  )
}

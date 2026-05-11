import { fetchGraphQL } from '@/lib/graphql'
import HeroBackground from '@/components/HeroBackground'
import GeometricPattern from '@/components/GeometricPattern'
import MatrixText from '@/components/MatrixText'
import Image from 'next/image'
import ServiceCard from '@/components/ServiceCard'

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
    services(first: 3) {
      nodes {
        title
        slug
        services {
          serviceTexte
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
      services: { serviceTexte: string } | null
    }[]
  }
}

export default async function Home() {
  const data = await fetchGraphQL<HomeData>(GET_HOME_DATA)
  const siteTitle = data.generalSettings.title
  const raw = data.subtitles.nodes[0]?.heroHomepage?.subtitles ?? ''
  const subtitles = raw.split('\n').map(s => s.trim()).filter(Boolean)
  const services = data.services.nodes

  return (
    <main>
      <HeroBackground />
      <GeometricPattern />
      {/* Marianne — absolute par rapport au viewport, scrolle avec la page */}
      <div style={{
        position: 'absolute',
        top: '-5vh',
        left: '-2vw',
        width: '39vw',
        height: '110vh',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 10001,
      }}>
        <Image
          src="/images/mariane2.png"
          alt=""
          fill
          sizes="33vw"
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
          draggable={false}
        />
      </div>

      {/* Hero — titre + sous-titre à droite */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: '0 2rem',
        textAlign: 'right',
        userSelect: 'none',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: 'clamp(2rem, 4vw, 5rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          color: 'white',
          lineHeight: 1.1,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          {siteTitle.split(' ').map((word, i) => (
            <span key={i} style={{ display: 'block' }}>{word}</span>
          ))}
        </h1>
        <MatrixText phrases={subtitles} />
      </div>
      {/* Section services — pleine largeur */}
      {/* Section services — pleine largeur, futuriste */}
      <section style={{
        position: 'relative',
        zIndex: 10002,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginTop: '-4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        background: 'rgba(180,180,180,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        {services.map(service => (
          <ServiceCard key={service.slug} title={service.title} slug={service.slug} />
        ))}
      </section>
    </main>
  )
}

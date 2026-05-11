import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'
import Link from 'next/link'

const GET_PROJETS = `
  query GetProjets {
    projets {
      nodes {
        slug
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
  }
`

type Projet = {
  slug: string
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

type ProjetData = {
  projets: {
    nodes: Projet[]
  }
}

export default async function PortfolioPage() {
  const data = await fetchGraphQL<ProjetData>(GET_PROJETS)
  const projets = data.projets.nodes

  return (
    <main>
      <h1>Portfolio</h1>
      <ul>
        {projets.map((projet) => (
          <li key={projet.slug}>
            {projet.portfolio.projetImage?.node && (
              <Image
                src={projet.portfolio.projetImage.node.sourceUrl}
                alt={projet.portfolio.projetImage.node.altText || projet.title}
                width={600}
                height={400}
              />
            )}
            <Link href={`/portfolio/${projet.slug}`}>
              <h2>{projet.title}</h2>
            </Link>
            <p>{projet.portfolio.projetDescription}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'
import Link from 'next/link'

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
  }
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fetchGraphQL<ProjetData>(GET_PROJET, { slug })
  const { title, portfolio } = data.projet

  return (
    <main>
      <Link href="/portfolio">← Retour au portfolio</Link>
      <h1>{title}</h1>
      {portfolio.projetImage?.node && (
        <Image
          src={portfolio.projetImage.node.sourceUrl}
          alt={portfolio.projetImage.node.altText || title}
          width={1200}
          height={800}
        />
      )}
      <p>{portfolio.projetDescription}</p>
      {portfolio.projetLien && (
        <a href={portfolio.projetLien} target="_blank" rel="noopener noreferrer">
          Voir le site
        </a>
      )}
    </main>
  )
}

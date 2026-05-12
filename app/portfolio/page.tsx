import { fetchGraphQL } from '@/lib/graphql'
import PortfolioGrid from '@/components/PortfolioGrid'

const GET_PROJETS = `
  query GetProjets {
    projets(first: 100) {
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

type ProjetData = {
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

export default async function PortfolioPage() {
  const data = await fetchGraphQL<ProjetData>(GET_PROJETS)
  const projets = data.projets.nodes.map(p => ({
    slug: p.slug,
    title: p.title,
    projetLien: p.portfolio?.projetLien ?? '',
    imageUrl: p.portfolio?.projetImage?.node.sourceUrl ?? '',
    altText: p.portfolio?.projetImage?.node.altText ?? '',
  }))

  return (
    <main style={{ padding: '6rem 2rem 4rem' }}>
      <h1 className="section-title">Portfolio</h1>
      <PortfolioGrid projets={projets} />
    </main>
  )
}

import { fetchGraphQL } from '@/lib/graphql'
import PortfolioGrid from '@/components/PortfolioGrid'

function stripHtml(html: string) {
  return html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const GET_PROJETS = `
  query GetProjets {
    projets(first: 100) {
      nodes {
        slug
        title
        portfolio {
          projetLien
          projetDescription
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
        projetDescription: string
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
    description: stripHtml(p.portfolio?.projetDescription ?? ''),
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

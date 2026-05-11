import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'

const GET_A_PROPOS = `
  query GetAPropos {
    pageBy(uri: "/a-propos") {
      title
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`

type AProposData = {
  pageBy: {
    title: string
    content: string
    featuredImage: {
      node: {
        sourceUrl: string
        altText: string
      }
    } | null
  }
}

export default async function AProposPage() {
  const data = await fetchGraphQL<AProposData>(GET_A_PROPOS)
  const { title, content, featuredImage } = data.pageBy

  return (
    <main>
      <h1>{title}</h1>
      {featuredImage && (
        <Image
          src={featuredImage.node.sourceUrl}
          alt={featuredImage.node.altText || title}
          width={600}
          height={600}
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  )
}

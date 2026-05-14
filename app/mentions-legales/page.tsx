import { fetchGraphQL } from '@/lib/graphql'
import RichContent from '@/components/RichContent'
import { decodeHtml } from '@/lib/decodeHtml'

const GET_PAGE = `
  query GetPage($slug: ID!) {
    page(id: $slug, idType: URI) {
      title
      content
    }
  }
`

type PageData = {
  page: {
    title: string
    content: string
  }
}


export default async function MentionsLegalesPage() {
  const data = await fetchGraphQL<PageData>(GET_PAGE, { slug: 'mentions-legales' })
  const { title, content } = data.page

  return (
    <main className="page-main">
      <h1 className="page-title">{title}</h1>
      <RichContent html={decodeHtml(content)} className="projet-content" />
    </main>
  )
}

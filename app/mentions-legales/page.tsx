import { fetchGraphQL } from '@/lib/graphql'

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

function decodeHtml(html: string) {
  return html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
}

export default async function MentionsLegalesPage() {
  const data = await fetchGraphQL<PageData>(GET_PAGE, { slug: 'mentions-legales' })
  const { title, content } = data.page

  return (
    <main className="page-main">
      <h1 className="page-title">{title}</h1>
      <div
        className="projet-content"
        dangerouslySetInnerHTML={{ __html: decodeHtml(content) }}
      />
    </main>
  )
}

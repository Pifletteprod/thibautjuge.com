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
    <main style={{ padding: '8rem 2rem 4rem', maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-orbitron)',
        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '3rem',
      }}>
        {title}
      </h1>
      <div
        className="projet-content"
        dangerouslySetInnerHTML={{ __html: decodeHtml(content) }}
      />
    </main>
  )
}

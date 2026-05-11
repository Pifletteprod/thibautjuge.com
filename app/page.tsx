import { fetchGraphQL } from '@/lib/graphql'

const GET_SITE_TITLE = `
  query GetSiteTitle {
    generalSettings {
      title
    }
  }
`

type SiteTitleData = {
  generalSettings: {
    title: string
  }
}

export default async function Home() {
  const data = await fetchGraphQL<SiteTitleData>(GET_SITE_TITLE)
  const siteTitle = data.generalSettings.title

  return (
    <main>
      <h1>{siteTitle}</h1>
    </main>
  )
}

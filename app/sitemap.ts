import type { MetadataRoute } from 'next'

const SITE_URL = 'https://thibautjuge.com'
const WP_GRAPHQL = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ?? 'https://cms.thibautjuge.com/graphql'

type WPServiceNode = { uri: string; modified: string }
type WPProjetNode = { slug: string; modified: string }

async function fetchAllServices(): Promise<WPServiceNode[]> {
  const res = await fetch(WP_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query { services(first: 100, where: { status: PUBLISH }) { nodes { uri modified } } }`,
    }),
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data?.services?.nodes ?? []
}

async function fetchAllProjets(): Promise<WPProjetNode[]> {
  const res = await fetch(WP_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query { projets(first: 100, where: { status: PUBLISH }) { nodes { slug modified } } }`,
    }),
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data?.projets?.nodes ?? []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projets] = await Promise.all([fetchAllServices(), fetchAllProjets()])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/me-contacter`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => {
    const depth = s.uri.replace(/^\/services\//, '').replace(/\/$/, '').split('/').length
    return {
      url: `${SITE_URL}${s.uri.replace(/\/$/, '')}`,
      lastModified: new Date(s.modified),
      changeFrequency: 'monthly',
      priority: depth === 1 ? 0.9 : 0.8,
    }
  })

  const projetRoutes: MetadataRoute.Sitemap = projets.map((p) => ({
    url: `${SITE_URL}/portfolio/${p.slug}`,
    lastModified: new Date(p.modified),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes, ...projetRoutes]
}

const SITE_URL = 'https://thibautjuge.com'

type Ancestor = { title: string; uri: string }

type ServiceForJsonLd = {
  title: string
  uri: string
  description: string
  ancestors: Ancestor[]
}

export function buildServiceSchema(s: ServiceForJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.description,
    url: `${SITE_URL}${s.uri}`,
    provider: {
      '@type': 'Person',
      name: 'Thibaut Juge',
      url: SITE_URL,
      jobTitle: 'Développeur web freelance',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Toulouse',
        addressCountry: 'FR',
      },
    },
    areaServed: { '@type': 'Country', name: 'France' },
  }
}

export function buildBreadcrumbSchema(s: ServiceForJsonLd) {
  const items = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Services', url: `${SITE_URL}/services/` },
    ...s.ancestors.map((a) => ({ name: a.title, url: `${SITE_URL}${a.uri}` })),
    { name: s.title, url: `${SITE_URL}${s.uri}` },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

type FaqItem = { question: string; answer: string }

export function extractFaqFromHtml(html: string): FaqItem[] {
  const match = html.match(/<h2[^>]*>Questions\s+fr[ée]quentes[^<]*<\/h2>/i)
  if (!match || match.index === undefined) return []

  const faqSection = html.substring(match.index)
  const itemPattern = /<h3[^>]*>([^<]+)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g

  const items: FaqItem[] = []
  let m: RegExpExecArray | null
  while ((m = itemPattern.exec(faqSection)) !== null) {
    items.push({
      question: m[1].trim(),
      answer: m[2].replace(/<[^>]+>/g, '').trim(),
    })
  }
  return items
}

export function buildFaqSchema(faqs: FaqItem[]) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

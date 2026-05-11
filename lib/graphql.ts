const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL!

export async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`GraphQL fetch failed: ${res.status}`)

  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)

  return data as T
}

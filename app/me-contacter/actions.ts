'use server'

type LeadPayload = {
  prenom: string
  nom: string
  email: string
  telephone: string
  societe: string
  site_actuel: string
  type_besoin: string
  budget: string
  message: string
  cf_token: string
}

export async function submitLead(payload: LeadPayload) {
  const res = await fetch('https://crm.piflette.com/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.CRM_TOKEN!}`,
    },
    body: JSON.stringify({ ...payload, source: 'pro', site_actuel: payload.site_actuel || undefined }),
  })

  const text = await res.text()
  console.log('CRM status:', res.status, '| body:', text.slice(0, 300))
  let data: Record<string, unknown> = {}
  try { data = JSON.parse(text) } catch { /* réponse non-JSON */ }

  if (!res.ok) throw new Error(`${res.status} – ${text.slice(0, 300)}`)

  return data
}

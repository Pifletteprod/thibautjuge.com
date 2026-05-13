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
      'X-Piflette-Token': process.env.CRM_TOKEN!,
    },
    body: JSON.stringify({ ...payload, source: 'pro' }),
  })

  const text = await res.text()
  console.log('CRM status:', res.status, '| body:', text.slice(0, 300))
  let data: Record<string, unknown> = {}
  try { data = JSON.parse(text) } catch { /* réponse non-JSON */ }

  if (!res.ok) throw new Error((data.error as string) || 'Erreur inconnue')

  return data
}

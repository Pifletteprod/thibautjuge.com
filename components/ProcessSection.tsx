import { fetchGraphQL } from '@/lib/graphql'
import Image from 'next/image'

const GET_ETAPES = `
  query GetEtapes {
    etapes(first: 4, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        processus {
          etapeTexte
          etapeImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`

type Etape = {
  title: string
  processus: {
    etapeTexte: string
    etapeImage: { node: { sourceUrl: string; altText: string } } | null
  } | null
}

function decodeHtml(html: string) {
  return html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
}

export default async function ProcessSection() {
  const data = await fetchGraphQL<{ etapes: { nodes: Etape[] } }>(GET_ETAPES)
  const etapes = data.etapes.nodes

  return (
    <section className="process">
      <div className="process-header">
        <h2 className="section-title">Ma méthode</h2>
        <h3 className="process-subtitle">Un processus clair, du brief à la mise en ligne</h3>
        <p className="process-intro">Chaque projet suit les mêmes étapes qui ont déjà fait leur preuve pour garantir un résultat à la hauteur de vos attentes.</p>
      </div>

      <div className="process-steps">
        {etapes.map((etape, i) => {
          const image = etape.processus?.etapeImage?.node
          const texte = etape.processus?.etapeTexte ?? ''
          const reversed = i % 2 === 0

          return (
            <div key={i} className={`process-step${reversed ? ' process-step--reversed' : ''}`}>
              <div className="process-step-text">
                <span className="process-step-number">0{i + 1}</span>
                <h3 className="process-step-title">{etape.title}</h3>
                {texte && <div className="process-step-body" dangerouslySetInnerHTML={{ __html: decodeHtml(texte) }} />}
              </div>
              {image && (
                <div className="process-step-image">
                  <Image
                    src={image.sourceUrl}
                    alt={image.altText || etape.title}
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

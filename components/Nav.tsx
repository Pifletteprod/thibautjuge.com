import { fetchGraphQL } from '@/lib/graphql'
import Link from 'next/link'
import NavBandeau from './NavBandeau'

const GET_MENU = `
  query GetMenu {
    menus(where: { location: PRIMARY }) {
      nodes {
        menuItems {
          nodes {
            label
            path
          }
        }
      }
    }
  }
`

type MenuData = {
  menus: {
    nodes: {
      menuItems: {
        nodes: { label: string; path: string }[]
      }
    }[]
  }
}

export default async function Nav() {
  const data = await fetchGraphQL<MenuData>(GET_MENU)
  const pages = data.menus.nodes[0]?.menuItems.nodes ?? []

  return (
    <nav style={{
      position:        'fixed',
      top:             0,
      left:            0,
      right:           0,
      zIndex:          200,
      backgroundColor: 'rgba(255,255,255,0.08)',
      backdropFilter:  'blur(12px)',
      borderBottom:    '1px solid rgba(255,255,255,0.15)',
      height:          '56px',
    }}>
      <div style={{
        maxWidth:      '1280px',
        margin:        '0 auto',
        width:         '100%',
        height:        '100%',
        display:       'flex',
        flexDirection: 'row',
        alignItems:    'center',
        gap:             '2.5rem',
        padding:         '0 2rem',
        justifyContent:  'center',
      }}>
      <div className="nav-desktop">
        {pages.map(page => (
          <Link
            key={page.path}
            href={page.path}
            style={{
              fontSize:      '0.7rem',
              fontWeight:    600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color:         'rgba(255,255,255,0.85)',
              textDecoration: 'none',
            }}
          >
            {page.label}
          </Link>
        ))}
      </div>
      <div className="nav-mobile">
        <NavBandeau pages={pages} />
      </div>
      </div>
    </nav>
  )
}

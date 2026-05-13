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
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-desktop">
          {pages.map(page => (
            <Link key={page.path} href={page.path} className="nav-link">
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

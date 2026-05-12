import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 2rem',
      textAlign: 'center',
      fontSize: '0.7rem',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '0.05em',
    }}>
      Thibaut Juge EI — SIRET : 75056634100038
      {' · '}
      <Link href="/mentions-legales" style={{ color: 'inherit', textDecoration: 'none' }}>
        Mentions légales
      </Link>
    </footer>
  )
}

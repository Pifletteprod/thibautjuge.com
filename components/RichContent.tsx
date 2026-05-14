import parse, { domToReact, Element, type HTMLReactParserOptions } from 'html-react-parser'
import Link from 'next/link'

type Props = { html: string; className?: string }

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

const options: HTMLReactParserOptions = {
  replace: (node) => {
    if (!(node instanceof Element) || node.name !== 'a') return
    const href = node.attribs?.href
    if (!href) return
    if (isInternal(href)) {
      return <Link href={href}>{domToReact(node.children as Parameters<typeof domToReact>[0], options)}</Link>
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...node.attribs}>
        {domToReact(node.children as Parameters<typeof domToReact>[0], options)}
      </a>
    )
  },
}

export default function RichContent({ html, className }: Props) {
  return <div className={className}>{parse(html, options)}</div>
}

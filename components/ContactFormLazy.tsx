'use client'

import dynamic from 'next/dynamic'

const ContactForm = dynamic(() => import('@/app/me-contacter/ContactForm'), { ssr: false })

export default function ContactFormLazy() {
  return <ContactForm />
}

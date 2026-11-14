import Link from 'next/link'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { footerNav } from '@/config/nav'
import { Logo } from './logo'

const columns = [
  { title: 'Offre', links: footerNav.offre },
  { title: 'Le garage', links: footerNav.garage },
  { title: 'Informations', links: footerNav.legal },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{siteConfig.tagline}</p>
          <div className="mt-6 flex gap-2">
            <a href={siteConfig.social.tiktok} aria-label="TikTok" className="rounded-full border border-line bg-white p-2.5 text-muted transition-colors hover:text-accent">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.2-.02-.4-.06-.59v-3.5a6.34 6.34 0 1 0 3.51 5.68V9.39a8.16 8.16 0 0 0 4.77 1.54V7.5a4.85 4.85 0 0 1-1-.81Z" />
              </svg>
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-semibold">Nous joindre</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              {siteConfig.contact.address}
            </li>
            {siteConfig.contact.phone && (
              <li className="flex gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${String(siteConfig.contact.phone).replace(/\s/g, '')}`} className="hover:text-accent">
                  {siteConfig.contact.phone}
                </a>
              </li>
            )}
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              {siteConfig.contact.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.legalName}. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  )
}

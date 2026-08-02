import type { Metadata, Viewport } from 'next'
import { Sora, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { siteConfig } from '@/config/site'
import './globals.css'

const display = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Location et vente de vehicules`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['location voiture', 'vente voiture', 'garage', siteConfig.name, 'Benin'],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Location et vente de vehicules`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Aller au contenu
        </a>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}

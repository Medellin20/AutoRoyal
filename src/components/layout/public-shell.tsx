import { Navbar } from './navbar'
import { Footer } from './footer'
import { WhatsAppButton } from './whatsapp-button'

/** Enveloppe commune a toutes les pages publiques. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="contenu">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

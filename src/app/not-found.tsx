import Link from 'next/link'
import { PublicShell } from '@/components/layout/public-shell'
import { ButtonLink } from '@/components/ui/button'

export default function NotFound() {
  return (
    <PublicShell>
      <section className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-7xl font-semibold text-accent">404</p>
        <div className="rule-gold mt-6" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Cette page n&apos;existe pas</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Le lien est peut-etre ancien, ou le vehicule a ete retire du catalogue. Le reste du parc
          vous attend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/vehicules">Voir les vehicules</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Retour a l&apos;accueil
          </ButtonLink>
        </div>
        <Link href="/contact" className="mt-6 text-sm text-accent">
          Vous cherchiez un modele precis ? Ecrivez-nous.
        </Link>
      </section>
    </PublicShell>
  )
}

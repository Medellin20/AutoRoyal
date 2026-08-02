import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/public-shell'
import { Faq, faqItems } from '@/components/home/sections'
import { ButtonLink } from '@/components/ui/button'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Questions fréquentes',
  description: 'Documents necessaires, caution, kilometrage, financement, panne : les reponses utiles avant de réserver.',
  path: '/faq',
})

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Aide</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Questions fréquentes</h1>
        </div>
      </section>

      <Faq />

      <section className="shell pb-20">
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-xl font-semibold">Vôtre question n&apos;est pas la ?</h2>
          <p className="mt-2 text-sm text-muted">L'équipe repond sous 24 h ouvrées.</p>
          <ButtonLink href="/contact" className="mt-6">Poser ma question</ButtonLink>
        </div>
      </section>
    </PublicShell>
  )
}

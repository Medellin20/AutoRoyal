import { PublicShell } from './public-shell'

export type LegalSection = { title: string; body: string[] }

export function LegalPage({
  eyebrow,
  title,
  updatedAt,
  sections,
}: {
  eyebrow: string
  title: string
  updatedAt: string
  sections: LegalSection[]
}) {
  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">{eyebrow}</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm text-muted">Derniere mise a jour : {updatedAt}</p>
        </div>
      </section>

      <article className="shell max-w-3xl py-12">
        {sections.map((section, i) => (
          <section key={section.title} className={i > 0 ? 'mt-10' : ''}>
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            {section.body.map((paragraph, j) => (
              <p key={j} className="mt-3 text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </PublicShell>
  )
}

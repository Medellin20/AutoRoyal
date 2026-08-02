import { SearchX } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'

export function EmptyState({
  title = 'Aucun vehicule ne correspond',
  description = 'Elargissez la fourchette de prix ou retirez un filtre pour voir plus de resultats.',
  actionHref = '/vehicules',
  actionLabel = 'Reinitialiser les filtres',
}: {
  title?: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-accent shadow-soft">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>
      <ButtonLink href={actionHref} variant="secondary" size="sm" className="mt-6">
        {actionLabel}
      </ButtonLink>
    </div>
  )
}

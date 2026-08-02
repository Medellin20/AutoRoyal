import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { PageHeader } from '@/components/admin/page-header'
import { SettingsForm } from '@/components/admin/settings-form'
import { UserManager } from '@/components/admin/user-manager'
import { formatDateTime } from '@/lib/utils'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Parametres' }

export default async function SettingsPage() {
  const session = await auth()
  const isSuperAdmin = can(session?.user.role, 'user:manage')

  const [settings, users, logs] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 'default' } }),
    isSuperAdmin
      ? prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
      : Promise.resolve([]),
    can(session?.user.role, 'audit:read')
      ? prisma.auditLog.findMany({ take: 15, orderBy: { createdAt: 'desc' } })
      : Promise.resolve([]),
  ])

  return (
    <>
      <PageHeader
        title="Parametres"
        description="Coordonnees affichees sur le site, comptes de l equipe et journal des actions."
      />

      <div className="space-y-6">
        <SettingsForm
          settings={settings}
          canEdit={can(session?.user.role, 'settings:update')}
        />

        {isSuperAdmin && <UserManager users={users} currentUserId={session!.user.id} />}

        {logs.length > 0 && (
          <section className="rounded-card border border-line bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Journal des actions</h2>
            <p className="mt-1 text-sm text-muted">Les 15 dernieres operations administratives.</p>

            <ul className="mt-5 divide-y divide-line text-sm">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="font-medium">{log.action}</span>
                    <span className="ml-2 text-muted">{log.entity}</span>
                  </span>
                  <span className="text-xs text-muted">
                    {log.userEmail} - {formatDateTime(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Personnalisation avancee</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Le nom, le logo, la palette, les liens sociaux et les lieux de retrait sont definis dans
            le fichier <code className="rounded bg-white px-1.5 py-0.5 text-xs">src/config/site.ts</code>.
            Les couleurs se modifient dans <code className="rounded bg-white px-1.5 py-0.5 text-xs">src/app/globals.css</code>.
            Site actuel : {siteConfig.name}.
          </p>
        </section>
      </div>
    </>
  )
}

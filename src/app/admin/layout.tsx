import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export const metadata = {
  title: { default: 'Administration', template: '%s - Administration AutoRoyal' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Le middleware protege deja ces routes ; ce controle serveur est la deuxieme barriere.
  if (!session?.user) redirect('/admin/login')

  return <AdminShell user={session.user}>{children}</AdminShell>
}

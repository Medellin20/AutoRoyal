import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'
import { Logo } from '@/components/layout/logo'

export const metadata: Metadata = {
  title: 'Connexion administrateur',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/admin')

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-card border border-line bg-white p-7 shadow-soft">
          <h1 className="font-display text-xl font-semibold">Espace administrateur</h1>
          <p className="mt-1.5 text-sm text-muted">
            Connectez-vous pour gerer le parc, les reservations et les demandes.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Apres cinq echecs, l&apos;acces est bloque 15 minutes.
        </p>
      </div>
    </main>
  )
}

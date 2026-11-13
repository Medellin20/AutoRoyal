'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Field, Input, Select } from '@/components/ui/field'
import { createAdminUser, toggleUserActive } from '@/server/actions/settings'
import { roleLabels } from '@/lib/labels'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/database'

export function UserManager({
  users,
  currentUserId,
}: {
  users: User[]
  currentUserId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function onCreate(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await createAdminUser(formData)
      if (result.ok) {
        toast.success(result.message ?? 'Compte cree.')
        setOpen(false)
        router.refresh()
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleUserActive(id, active)
      if (result.ok) {
        toast.success(result.message ?? '')
        router.refresh()
      } else toast.error(result.message)
    })
  }

  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Comptes de l&apos;equipe</h2>
          <p className="mt-1 text-sm text-muted">
            Le gestionnaire gere le parc et les demandes. La suppression et les comptes restent au
            super administrateur.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Ajouter un compte
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-4 font-medium">Nom</th>
              <th className="py-3 pr-4 font-medium">E-mail</th>
              <th className="py-3 pr-4 font-medium">Role</th>
              <th className="py-3 pr-4 font-medium">Derniere connexion</th>
              <th className="py-3 text-right font-medium">Etat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-3 pr-4 font-medium">{user.name}</td>
                <td className="py-3 pr-4 text-muted">{user.email}</td>
                <td className="py-3 pr-4">
                  <Badge tone={user.role === 'SUPER_ADMIN' ? 'gold' : 'accent'}>
                    {roleLabels[user.role]}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-muted">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'}
                </td>
                <td className="py-3 text-right">
                  {user.id === currentUserId ? (
                    <Badge tone="neutral">Vous</Badge>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => toggle(user.id, !user.active)}
                      className={`text-xs font-medium ${user.active ? 'text-danger' : 'text-success'}`}
                    >
                      {user.active ? 'Desactiver' : 'Reactiver'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un compte">
        <form action={onCreate} className="space-y-4" noValidate>
          <Field label="Nom complet" htmlFor="name" required error={errors.name?.[0]}>
            <Input id="name" name="name" required />
          </Field>

          <Field label="Adresse e-mail" htmlFor="new-email" required error={errors.email?.[0]}>
            <Input id="new-email" name="email" type="email" required />
          </Field>

          <Field
            label="Mot de passe"
            htmlFor="new-password"
            required
            error={errors.password?.[0]}
            hint="10 caracteres minimum, avec au moins une majuscule et un chiffre."
          >
            <Input id="new-password" name="password" type="password" autoComplete="new-password" required />
          </Field>

          <Field label="Role" htmlFor="role" required error={errors.role?.[0]}>
            <Select id="role" name="role" defaultValue="MANAGER">
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={pending}>
              Creer le compte
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

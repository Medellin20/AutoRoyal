'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { loginSchema } from '@/validations/auth'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }

    setLoading(true)
    const result = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      setError(
        result.error === 'CredentialsSignin'
          ? 'E-mail ou mot de passe incorrect.'
          : result.error,
      )
      return
    }

    router.push(params.get('callbackUrl') ?? '/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <Field label="Adresse e-mail" htmlFor="email" required error={fieldErrors.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required error={fieldErrors.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <Button type="submit" className="w-full" loading={loading}>
        Se connecter
      </Button>
    </form>
  )
}

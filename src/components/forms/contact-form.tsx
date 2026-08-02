'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { sendContactMessage } from '@/server/actions/contact'

export function ContactForm() {
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [sent, setSent] = useState(false)

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await sendContactMessage(formData)
      if (result.ok) {
        setSent(true)
        toast.success(result.message ?? 'Message envoye.')
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  if (sent) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Message recu</h2>
        <p className="mt-2 text-sm text-muted">Nous repondons sous 24 h ouvrees.</p>
        <Button variant="secondary" className="mt-5" onClick={() => setSent(false)}>
          Ecrire un autre message
        </Button>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="space-y-4" noValidate>
      <fieldset className="space-y-4" disabled={pending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" htmlFor="fullName" required error={errors.fullName?.[0]}>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </Field>
          <Field label="Telephone" htmlFor="phone" error={errors.phone?.[0]}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </Field>
        </div>

        <Field label="Adresse e-mail" htmlFor="email" required error={errors.email?.[0]}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>

        <Field label="Objet" htmlFor="subject" required error={errors.subject?.[0]}>
          <Input id="subject" name="subject" placeholder="Essai routier, disponibilite, facture..." required />
        </Field>

        <Field label="Message" htmlFor="message" required error={errors.message?.[0]}>
          <Textarea id="message" name="message" rows={6} required />
        </Field>
      </fieldset>

      <Button type="submit" loading={pending}>
        Envoyer le message
      </Button>
    </form>
  )
}

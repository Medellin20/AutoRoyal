'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/field'
import { updateSettings } from '@/server/actions/settings'
import { siteConfig } from '@/config/site'
import type { SiteSetting } from '@/types/database'

export function SettingsForm({
  settings,
  canEdit,
}: {
  settings: SiteSetting | null
  canEdit: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'PAYMENT_LINK'>(settings?.paymentMethod ?? 'BANK_TRANSFER')

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.ok) toast.success(result.message ?? 'Enregistre.')
      else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  const fields = [
    { name: 'garageName', label: 'Nom du garage', value: settings?.garageName ?? siteConfig.name, required: true },
    { name: 'tagline', label: 'Accroche', value: settings?.tagline ?? siteConfig.tagline },
    { name: 'phone', label: 'Telephone', value: settings?.phone ?? siteConfig.contact.phone },
    { name: 'whatsapp', label: 'WhatsApp', value: settings?.whatsapp ?? siteConfig.contact.whatsapp },
    { name: 'email', label: 'E-mail', value: settings?.email ?? siteConfig.contact.email, type: 'email' },
    { name: 'address', label: 'Adresse', value: settings?.address ?? siteConfig.contact.address },
    { name: 'mapUrl', label: 'Lien de la carte', value: settings?.mapUrl ?? siteConfig.contact.mapEmbed, type: 'url' },
    { name: 'facebook', label: 'Facebook', value: settings?.facebook ?? siteConfig.social.facebook, type: 'url' },
    { name: 'instagram', label: 'Instagram', value: settings?.instagram ?? siteConfig.social.instagram, type: 'url' },
    { name: 'tiktok', label: 'TikTok', value: settings?.tiktok ?? siteConfig.social.tiktok, type: 'url' },
    { name: 'linkedin', label: 'LinkedIn', value: settings?.linkedin ?? siteConfig.social.linkedin, type: 'url' },
  ]

  return (
    <form action={onSubmit} className="rounded-card border border-line bg-white p-6 shadow-soft" noValidate>
      <h2 className="font-display text-lg font-semibold">Identite et coordonnees</h2>
      <p className="mt-1 text-sm text-muted">
        Ces valeurs alimentent le pied de page, la page contact et le bouton WhatsApp.
      </p>

      <fieldset className="mt-5 grid gap-4 sm:grid-cols-2" disabled={!canEdit || pending}>
        {fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            htmlFor={field.name}
            required={field.required}
            error={errors[field.name]?.[0]}
          >
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? 'text'}
              defaultValue={field.value ?? ''}
            />
          </Field>
        ))}

        <Field
          label="Couleur d accent"
          htmlFor="accentColor"
          error={errors.accentColor?.[0]}
          hint="Format hexadecimal, par exemple #ED1C24."
        >
          <Input
            id="accentColor"
            name="accentColor"
            type="color"
            defaultValue={settings?.accentColor ?? '#ED1C24'}
            className="h-11 w-24 p-1"
          />
        </Field>
      </fieldset>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-display text-base font-semibold">Paiement des commandes</h3>
        <p className="mt-1 text-sm text-muted">Ces informations s’affichent après la création d’une commande. Le reçu ne confirme jamais le paiement.</p>
        <fieldset className="mt-4 grid gap-4 sm:grid-cols-2" disabled={!canEdit || pending}>
          <Field label="Mode de paiement" htmlFor="paymentMethod" required error={errors.paymentMethod?.[0]}>
            <Select id="paymentMethod" name="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}>
              <option value="BANK_TRANSFER">Virement bancaire (RIB)</option>
              <option value="PAYMENT_LINK">Lien de paiement</option>
            </Select>
          </Field>
          {paymentMethod === 'BANK_TRANSFER' ? (
            <>
              <Field label="Titulaire du compte" htmlFor="bankAccountHolder" required error={errors.bankAccountHolder?.[0]}>
                <Input id="bankAccountHolder" name="bankAccountHolder" defaultValue={settings?.bankAccountHolder ?? ''} />
              </Field>
              <Field label="Banque" htmlFor="bankName" error={errors.bankName?.[0]}>
                <Input id="bankName" name="bankName" defaultValue={settings?.bankName ?? ''} />
              </Field>
              <Field label="IBAN" htmlFor="iban" required error={errors.iban?.[0]}>
                <Input id="iban" name="iban" autoComplete="off" defaultValue={settings?.iban ?? ''} />
              </Field>
              <Field label="BIC" htmlFor="bic" required error={errors.bic?.[0]}>
                <Input id="bic" name="bic" autoComplete="off" defaultValue={settings?.bic ?? ''} />
              </Field>
            </>
          ) : (
            <Field label="Lien sécurisé de paiement" htmlFor="paymentLinkUrl" required error={errors.paymentLinkUrl?.[0]}>
              <Input id="paymentLinkUrl" name="paymentLinkUrl" type="url" defaultValue={settings?.paymentLinkUrl ?? ''} placeholder="https://…" />
            </Field>
          )}
        </fieldset>
      </div>

      {canEdit ? (
        <Button type="submit" className="mt-6" loading={pending}>
          Enregistrer les parametres
        </Button>
      ) : (
        <p className="mt-6 rounded-xl bg-surface p-3 text-sm text-muted">
          Votre role permet la consultation, pas la modification.
        </p>
      )}
    </form>
  )
}

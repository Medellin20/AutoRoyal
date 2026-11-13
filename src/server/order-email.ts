type OrderAlert = {
  reference: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleLabel: string
  amount: string
  adminUrl: string
}

export async function sendOrderAlert(order: OrderAlert): Promise<{
  status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED'
  recipient: string
  detail?: string
}> {
  const recipient = process.env.ORDER_ALERT_EMAIL || process.env.ADMIN_EMAIL || ''
  const apiKey = process.env.RESEND_API_KEY
  const sender = process.env.RESEND_FROM_EMAIL
  if (!recipient || !apiKey || !sender) {
    return { status: 'NOT_CONFIGURED', recipient, detail: 'Resend or alert recipient is not configured.' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `Nouvelle commande ${order.reference} — ${order.vehicleLabel}`,
        text: [
          `Une nouvelle commande a été créée sur Laurent Crash Autos.`,
          `Référence : ${order.reference}`,
          `Véhicule : ${order.vehicleLabel}`,
          `Montant : ${order.amount}`,
          `Client : ${order.customerName}`,
          `E-mail : ${order.customerEmail}`,
          `Téléphone : ${order.customerPhone}`,
          `Paiement en attente de validation réelle.`,
          `Ouvrir l’espace commandes : ${order.adminUrl}`,
        ].join('\n'),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      const responseText = await response.text()
      return { status: 'FAILED', recipient, detail: responseText.slice(0, 1000) }
    }
    return { status: 'SENT', recipient }
  } catch (error) {
    return {
      status: 'FAILED',
      recipient,
      detail: error instanceof Error ? error.message.slice(0, 1000) : 'Erreur d’envoi inconnue.',
    }
  }
}

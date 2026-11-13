import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { SalesOrder, Customer } from '@/types/database'

export const runtime = 'nodejs'

function pdfText(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
}

export async function GET(request: Request, { params }: { params: { reference: string } }) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ message: 'Reçu introuvable.' }, { status: 404 })

  const db = getSupabaseAdmin()
  const { data: row, error } = await db.from('sales_orders').select('*')
    .eq('reference', params.reference).eq('guestAccessToken', token).maybeSingle()
  if (error || !row) return NextResponse.json({ message: 'Reçu introuvable.' }, { status: 404 })
  const order = row as SalesOrder
  const { data: customerRow } = await db.from('customers').select('*').eq('id', order.customerId).maybeSingle()
  if (!customerRow) return NextResponse.json({ message: 'Reçu indisponible.' }, { status: 404 })
  const customer = customerRow as Customer
  const vehicle = order.vehicleSnapshot

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.12, 0.12, 0.13)
  const red = rgb(0.90, 0.08, 0.12)
  page.drawText('LAURENT CRASH AUTOS', { x: 48, y: 780, size: 20, font: bold, color: ink })
  page.drawText('RECU DE CREATION DE COMMANDE', { x: 48, y: 730, size: 16, font: bold, color: red })
  page.drawText(`Reference : ${pdfText(order.reference)}`, { x: 48, y: 695, size: 12, font: bold, color: ink })
  page.drawText(`Date : ${pdfText(new Date(order.createdAt).toLocaleString('fr-FR'))}`, { x: 48, y: 675, size: 10, font, color: ink })
  page.drawText('CLIENT', { x: 48, y: 625, size: 10, font: bold, color: red })
  page.drawText(pdfText(customer.fullName), { x: 48, y: 605, size: 11, font, color: ink })
  page.drawText(pdfText(customer.email), { x: 48, y: 587, size: 10, font, color: ink })
  page.drawText(pdfText(customer.phone), { x: 48, y: 569, size: 10, font, color: ink })
  page.drawText('VEHICULE COMMANDE', { x: 48, y: 520, size: 10, font: bold, color: red })
  page.drawText(pdfText(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`), { x: 48, y: 498, size: 12, font: bold, color: ink })
  page.drawText(`Reference vehicule : ${pdfText(vehicle.reference)}`, { x: 48, y: 478, size: 10, font, color: ink })
  const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: String(vehicle.currency ?? 'EUR') }).format(order.totalAmount).replace(/[\u202f\u00a0]/g, ' ')
  page.drawText(`Montant de la commande : ${amount}`, { x: 48, y: 438, size: 12, font: bold, color: ink })
  page.drawText(`Statut du paiement : ${order.paymentStatus === 'CONFIRMED' ? 'Confirme par Laurent Crash Autos' : order.paymentStatus === 'REJECTED' ? 'A regulariser' : 'En attente de verification'}`, { x: 48, y: 416, size: 10, font, color: ink })
  page.drawText(`Statut de la commande : ${order.status === 'CANCELLED' ? 'Annulee' : order.status === 'PAYMENT_CONFIRMED' ? 'Paiement confirme' : 'En attente de paiement'}`, { x: 48, y: 397, size: 10, font, color: ink })
  page.drawText('Ce document confirme la creation de la commande uniquement.', { x: 48, y: 345, size: 10, font: bold, color: red })
  page.drawText('Il ne constitue pas une preuve de paiement. Le telechargement du recu', { x: 48, y: 327, size: 9, font, color: ink })
  page.drawText('ne modifie pas le statut du paiement. Une validation reelle par notre equipe', { x: 48, y: 311, size: 9, font, color: ink })
  page.drawText('est necessaire pour confirmer la reception des fonds.', { x: 48, y: 295, size: 9, font, color: ink })
  page.drawLine({ start: { x: 48, y: 65 }, end: { x: 547, y: 65 }, thickness: 1, color: rgb(0.85, 0.85, 0.86) })
  page.drawText('Laurent Crash Autos - Vente de vehicules accidentes', { x: 48, y: 45, size: 8, font, color: ink })

  const bytes = await pdf.save()
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-${order.reference}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

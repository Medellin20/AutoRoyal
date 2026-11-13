export const fuelLabels: Record<string, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Electrique',
  GPL: 'GPL',
}

export const transmissionLabels: Record<string, string> = {
  MANUELLE: 'Manuelle',
  AUTOMATIQUE: 'Automatique',
}

export const categoryLabels: Record<string, string> = {
  BERLINE: 'Berline',
  SUV: 'SUV',
  CITADINE: 'Citadine',
  PICKUP: 'Pick-up',
  UTILITAIRE: 'Utilitaire',
  MONOSPACE: 'Monospace',
  COUPE: 'Coupe',
  LUXE: 'Luxe',
}

export const offerTypeLabels: Record<string, string> = {
  SALE: 'A vendre',
  RENT: 'A louer',
  BOTH: 'Vente et location',
}

export const vehicleStatusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reserve',
  RENTED: 'En location',
  SOLD: 'Vendu',
  MAINTENANCE: 'En maintenance',
}

export const vehicleStatusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'accent'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  RENTED: 'accent',
  SOLD: 'neutral',
  MAINTENANCE: 'danger',
}

export const damageLevelLabels: Record<string, string> = {
  LEGER: 'Dommages légers',
  MODERE: 'Dommages modérés',
  IMPORTANT: 'Dommages importants',
  NON_ROULANT: 'Véhicule non roulant',
  A_DEFINIR: 'État à préciser',
}

export const runningConditionLabels: Record<string, string> = {
  ROULANT: 'Roulant',
  DEMARRE: 'Démarre, à contrôler',
  NON_ROULANT: 'Non roulant',
  A_VERIFIER: 'À vérifier',
}

export const reservationStatusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmee',
  REFUSED: 'Refusee',
  CANCELLED: 'Annulee',
  ONGOING: 'En cours',
  COMPLETED: 'Terminee',
}

export const reservationStatusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'accent'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REFUSED: 'danger',
  CANCELLED: 'neutral',
  ONGOING: 'accent',
  COMPLETED: 'neutral',
}

export const purchaseStatusLabels: Record<string, string> = {
  NEW: 'Nouvelle',
  IN_PROGRESS: 'En traitement',
  NEGOTIATION: 'En negociation',
  CLOSED: 'Traitee',
  REFUSED: 'Refusee',
}

export const purchaseStatusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'accent'> = {
  NEW: 'warning',
  IN_PROGRESS: 'accent',
  NEGOTIATION: 'accent',
  CLOSED: 'success',
  REFUSED: 'danger',
}

export const paymentLabels: Record<string, string> = {
  CASH: 'Especes',
  VIREMENT: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile money',
  FINANCEMENT: 'Financement',
}

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
}

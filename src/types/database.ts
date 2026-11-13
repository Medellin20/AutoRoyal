export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'
export type OfferType = 'SALE' | 'RENT' | 'BOTH'
export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'SOLD' | 'MAINTENANCE'
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELLED' | 'ONGOING' | 'COMPLETED'
export type PurchaseStatus = 'NEW' | 'IN_PROGRESS' | 'NEGOTIATION' | 'CLOSED' | 'REFUSED'
export type PaymentMethod = 'CASH' | 'VIREMENT' | 'MOBILE_MONEY' | 'FINANCEMENT'
export type DamageLevel = 'LEGER' | 'MODERE' | 'IMPORTANT' | 'NON_ROULANT' | 'A_DEFINIR'
export type RunningCondition = 'ROULANT' | 'DEMARRE' | 'NON_ROULANT' | 'A_VERIFIER'
export type SalesOrderStatus = 'PENDING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'CANCELLED'
export type SalesPaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export type VehicleImage = {
  id: string
  vehicleId: string
  url: string
  publicId: string | null
  alt: string
  isMain: boolean
  position: number
  createdAt: string
}

export type Vehicle = {
  id: string
  reference: string
  slug: string
  brand: string
  model: string
  version: string | null
  category: string
  year: number
  offerType: OfferType
  status: VehicleStatus
  salePrice: number | null
  dailyPrice: number | null
  weeklyPrice: number | null
  monthlyPrice: number | null
  deposit: number | null
  mileage: number
  fuel: string
  transmission: string
  color: string
  seats: number
  doors: number
  power: number
  vin: string | null
  description: string
  features: string[]
  rentalConditions: string | null
  requiredDocuments: string[]
  featured: boolean
  published: boolean
  publishedAt: string | null
  views: number
  damageLevel: DamageLevel
  damageTypes: string[]
  runningCondition: RunningCondition
  title: string
  vehicleType: 'VOITURE' | 'UTILITAIRE' | 'MOTO' | 'CAMION' | 'AUTRE'
  engine: string
  displacement: number
  drivetrain: 'TRACTION' | 'PROPULSION' | 'INTEGRALE' | 'AUTRE'
  bodyCondition: 'BON' | 'MOYEN' | 'ENDOMMAGE' | 'A_VERIFIER'
  damageDescription: string
  titleStatus: 'A_VERIFIER' | 'CLAIR' | 'ACCIDENTE' | 'MANQUANT'
  city: string
  country: string
  currency: 'EUR' | 'USD' | 'GBP' | 'XOF'
  quantity: number
  keysCount: number
  internationalSale: boolean
  videoUrl: string | null
  createdAt: string
  updatedAt: string
  images?: VehicleImage[]
}

export type Customer = {
  id: string
  fullName: string
  email: string
  phone: string
  address: string | null
  createdAt: string
  updatedAt: string
  _count?: { reservations: number; purchaseRequests: number }
}

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type SiteSetting = {
  id: string
  garageName: string
  tagline: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  mapUrl: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  linkedin: string | null
  accentColor: string
  paymentMethod: 'BANK_TRANSFER' | 'PAYMENT_LINK'
  bankAccountHolder: string | null
  bankName: string | null
  iban: string | null
  bic: string | null
  paymentLinkUrl: string | null
  updatedAt: string
}

export type Reservation = {
  id: string
  reference: string
  vehicleId: string
  customerId: string
  startDate: string
  endDate: string
  pickupPlace: string
  returnPlace: string
  days: number
  totalPrice: number
  extraFees: number
  message: string | null
  internalNote: string | null
  status: ReservationStatus
  createdAt: string
  updatedAt: string
  customer?: Customer
  vehicle?: Vehicle
}

export type PurchaseRequest = {
  id: string
  reference: string
  vehicleId: string
  customerId: string
  budget: number | null
  payment: PaymentMethod
  financing: boolean
  tradeIn: boolean
  tradeInInfo: string | null
  message: string | null
  internalNote: string | null
  status: PurchaseStatus
  createdAt: string
  updatedAt: string
  customer?: Customer
  vehicle?: Vehicle
}

export type VehicleWithImages = Vehicle & { images: VehicleImage[] }
export type ReservationWithRelations = Reservation & { vehicle: Vehicle; customer: Customer }
export type PurchaseRequestWithRelations = PurchaseRequest & { vehicle: Vehicle; customer: Customer }

export type SalesOrder = {
  id: string
  reference: string
  customerId: string
  vehicleId: string
  guestAccessToken: string
  vehicleSnapshot: Record<string, unknown>
  paymentInstructions: {
    paymentMethod?: 'BANK_TRANSFER' | 'PAYMENT_LINK'
    bankAccountHolder?: string | null
    bankName?: string | null
    iban?: string | null
    bic?: string | null
    paymentLinkUrl?: string | null
  }
  totalAmount: number
  status: SalesOrderStatus
  paymentStatus: SalesPaymentStatus
  paymentReference: string | null
  internalNote: string | null
  createdAt: string
  updatedAt: string
}

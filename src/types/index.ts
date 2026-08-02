import type {
  Vehicle,
  VehicleImage,
  Reservation,
  Customer,
  PurchaseRequest,
  Role,
} from '@prisma/client'

export type VehicleWithImages = Vehicle & { images: VehicleImage[] }

export type ReservationWithRelations = Reservation & {
  vehicle: Pick<Vehicle, 'id' | 'brand' | 'model' | 'reference' | 'slug'>
  customer: Customer
}

export type PurchaseRequestWithRelations = PurchaseRequest & {
  vehicle: Pick<Vehicle, 'id' | 'brand' | 'model' | 'reference' | 'slug'>
  customer: Customer
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type VehicleFilters = {
  q?: string
  brand?: string
  model?: string
  category?: string
  fuel?: string
  transmission?: string
  offerType?: string
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
  sort?: string
  page?: string
}

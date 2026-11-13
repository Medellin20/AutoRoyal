import type { Role } from './database'
export type { Vehicle, VehicleImage, Reservation, Customer, PurchaseRequest, SiteSetting, User, Role } from './database'
export type { VehicleWithImages, ReservationWithRelations, PurchaseRequestWithRelations } from './database'

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

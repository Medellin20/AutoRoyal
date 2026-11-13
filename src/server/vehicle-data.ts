import 'server-only'
import { getSupabaseAdmin, getSupabasePublic, throwSupabaseError } from '@/lib/supabase'
import type { Vehicle, VehicleImage } from '@/types/database'

export async function getPublicVehiclesWithImages<T extends Vehicle>(vehicles: T[]) {
  if (!vehicles.length) return vehicles.map((vehicle) => ({ ...vehicle, images: [] as VehicleImage[] }))
  const { data, error } = await getSupabasePublic().from('vehicle_images').select('*')
    .in('vehicleId', vehicles.map((vehicle) => vehicle.id)).order('position')
  throwSupabaseError(error)
  const grouped = new Map<string, VehicleImage[]>()
  for (const image of (data ?? []) as VehicleImage[]) grouped.set(image.vehicleId, [...(grouped.get(image.vehicleId) ?? []), image])
  return vehicles.map((vehicle) => ({ ...vehicle, images: grouped.get(vehicle.id) ?? [] }))
}

export async function getAdminVehiclesWithImages<T extends Vehicle>(vehicles: T[]) {
  if (!vehicles.length) return vehicles.map((vehicle) => ({ ...vehicle, images: [] as VehicleImage[] }))
  const { data, error } = await getSupabaseAdmin().from('vehicle_images').select('*')
    .in('vehicleId', vehicles.map((vehicle) => vehicle.id)).order('position')
  throwSupabaseError(error)
  const grouped = new Map<string, VehicleImage[]>()
  for (const image of (data ?? []) as VehicleImage[]) grouped.set(image.vehicleId, [...(grouped.get(image.vehicleId) ?? []), image])
  return vehicles.map((vehicle) => ({ ...vehicle, images: grouped.get(vehicle.id) ?? [] }))
}

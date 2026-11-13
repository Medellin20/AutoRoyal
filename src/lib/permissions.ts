import type { Role } from '@/types/database'

/** Actions sensibles reservees a certains roles. */
export const permissions = {
  'vehicle:create': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'vehicle:update': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'vehicle:delete': ['SUPER_ADMIN', 'ADMIN'],
  'vehicle:publish': ['SUPER_ADMIN', 'ADMIN'],
  'reservation:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'reservation:update': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'reservation:export': ['SUPER_ADMIN', 'ADMIN'],
  'purchase:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'purchase:update': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'payment:verify': ['SUPER_ADMIN', 'ADMIN'],
  'customer:read': ['SUPER_ADMIN', 'ADMIN'],
  'customer:delete': ['SUPER_ADMIN'],
  'user:manage': ['SUPER_ADMIN'],
  'settings:update': ['SUPER_ADMIN', 'ADMIN'],
  'audit:read': ['SUPER_ADMIN'],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof permissions

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false
  return (permissions[permission] as readonly Role[]).includes(role)
}

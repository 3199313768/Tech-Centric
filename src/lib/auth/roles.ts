import { SITE_NAV_TABS, SITE_ROUTES } from '@/lib/site/routes'

export const SITE_ROLE = {
  super_admin: 'super_admin',
  user: 'user',
} as const

export type SiteRole = (typeof SITE_ROLE)[keyof typeof SITE_ROLE]

export function isSiteRole(value: string | null | undefined): value is SiteRole {
  return value === SITE_ROLE.super_admin || value === SITE_ROLE.user
}

export function getMainNavTabsForRole(role: SiteRole) {
  if (role === SITE_ROLE.super_admin) return [...SITE_NAV_TABS]
  return SITE_NAV_TABS.filter((tab) => tab.href !== SITE_ROUTES.knowledge)
}

export function isSuperAdminPath(pathname: string): boolean {
  return (
    pathname === SITE_ROUTES.knowledge ||
    pathname.startsWith(`${SITE_ROUTES.knowledge}/`) ||
    pathname === SITE_ROUTES.studio ||
    pathname.startsWith(`${SITE_ROUTES.studio}/`)
  )
}

export function isSafeNextPath(next: string | null | undefined): next is string {
  if (!next || !next.startsWith('/')) return false
  if (next.startsWith('//')) return false
  if (next.includes('://')) return false
  return true
}

export function resolvePostLoginPath(
  next: string | null | undefined,
  role: SiteRole,
): string {
  if (!isSafeNextPath(next)) return SITE_ROUTES.home
  if (isSuperAdminPath(next) && role !== SITE_ROLE.super_admin) {
    return SITE_ROUTES.home
  }
  return next
}

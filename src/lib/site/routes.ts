export const SITE_ROUTES = {
  home: '/',
  projects: '/projects',
  skills: '/skills',
  vibe: '/vibe',
  resources: '/resources',
  knowledge: '/knowledge',
} as const

export const SITE_NAV_TABS = [
  { href: SITE_ROUTES.home, label: '庭院' },
  { href: SITE_ROUTES.projects, label: '归档' },
  { href: SITE_ROUTES.skills, label: '技能工坊' },
  { href: SITE_ROUTES.vibe, label: '草本集' },
  { href: SITE_ROUTES.resources, label: '资源' },
] as const

export function isSiteNavActive(pathname: string, href: string): boolean {
  if (href === SITE_ROUTES.home) return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

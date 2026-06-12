export const SITE_ROUTES = {
  home: '/',
  projects: '/projects',
  skills: '/skills',
  vibe: '/vibe',
  resources: '/resources',
  knowledge: '/knowledge',
  about: '/about',
  showcase: '/showcase',
  search: '/search',
  changelog: '/changelog',
  studio: '/studio',
  stats: '/stats',
} as const

/** 顶栏主 Tab（5 项，降低首次访客认知负荷） */
export const SITE_NAV_TABS = [
  { href: SITE_ROUTES.home, label: '庭院' },
  { href: SITE_ROUTES.projects, label: '归档' },
  { href: SITE_ROUTES.vibe, label: '草本集' },
  { href: SITE_ROUTES.knowledge, label: '档案馆' },
  { href: SITE_ROUTES.about, label: '园主' },
] as const

/** 页脚 / 抽屉次级入口 */
export const SITE_NAV_SECONDARY = [
  { href: SITE_ROUTES.skills, label: '技能工坊' },
  { href: SITE_ROUTES.resources, label: '资源' },
] as const

export function isSiteNavActive(pathname: string, href: string): boolean {
  if (href === SITE_ROUTES.home) {
    return pathname === '/'
  }
  if (href === SITE_ROUTES.about) {
    return pathname === SITE_ROUTES.about
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** 资源页 AI 辅助 API（Route Handler 路径） */
export const RESOURCE_API_ROUTES = {
  explore: '/api/resources/explore',
  autofill: '/api/resources/autofill',
  meta: '/api/resources/meta',
} as const

export function projectRoute(slug: string): string {
  return `${SITE_ROUTES.projects}/${encodeURIComponent(slug)}`
}

export function vibeRoute(slug: string): string {
  return `${SITE_ROUTES.vibe}/${encodeURIComponent(slug)}`
}

export function knowledgePublicRoute(id: string): string {
  return `${SITE_ROUTES.knowledge}/${encodeURIComponent(id)}`
}

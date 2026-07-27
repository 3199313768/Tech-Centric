import { describe, expect, it } from 'vitest'
import {
  SITE_ROLE,
  getMainNavTabsForRole,
  isSuperAdminPath,
  isSafeNextPath,
  resolvePostLoginPath,
} from '@/lib/auth/roles'
import { SITE_ROUTES } from '@/lib/site/routes'

describe('getMainNavTabsForRole', () => {
  it('hides knowledge for user', () => {
    const hrefs = getMainNavTabsForRole(SITE_ROLE.user).map((t) => t.href)
    expect(hrefs).not.toContain(SITE_ROUTES.knowledge)
    expect(hrefs).toContain(SITE_ROUTES.home)
  })

  it('includes knowledge for super_admin', () => {
    const hrefs = getMainNavTabsForRole(SITE_ROLE.super_admin).map((t) => t.href)
    expect(hrefs).toContain(SITE_ROUTES.knowledge)
  })
})

describe('isSuperAdminPath', () => {
  it('matches knowledge and studio', () => {
    expect(isSuperAdminPath('/knowledge')).toBe(true)
    expect(isSuperAdminPath('/knowledge/abc')).toBe(true)
    expect(isSuperAdminPath('/studio')).toBe(true)
    expect(isSuperAdminPath('/projects')).toBe(false)
  })
})

describe('isSafeNextPath / resolvePostLoginPath', () => {
  it('rejects open redirects', () => {
    expect(isSafeNextPath('https://evil.com')).toBe(false)
    expect(isSafeNextPath('//evil.com')).toBe(false)
    expect(isSafeNextPath('/projects')).toBe(true)
  })

  it('blocks user from admin next', () => {
    expect(resolvePostLoginPath('/knowledge', SITE_ROLE.user)).toBe('/')
    expect(resolvePostLoginPath('/knowledge', SITE_ROLE.super_admin)).toBe('/knowledge')
  })
})

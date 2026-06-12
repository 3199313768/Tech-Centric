import { test, expect } from '@playwright/test'

test.describe('核心访客路径', () => {
  test('T1：首页 → 园主 → 归档', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '欢迎来到我的数字庭院' })).toBeVisible()

    await page.getByRole('link', { name: '了解我' }).click()
    await expect(page).toHaveURL(/\/about/)
    await expect(page.getByRole('heading', { name: /杨倩/ })).toBeVisible()

    await page.getByRole('link', { name: '查看归档' }).click()
    await expect(page).toHaveURL(/\/projects/)
  })

  test('T4：Footer 邮箱 mailto', async ({ page }) => {
    await page.goto('/about')
    const emailLink = page.getByRole('link', { name: /3199313768@qq.com/i }).first()
    await expect(emailLink).toHaveAttribute('href', /mailto:3199313768@qq.com/)
  })

  test('顶栏 5 Tab 信息架构', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('.sg-nav-links.sg-nav-desktop-only')
    await expect(nav.getByRole('link', { name: '庭院' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '归档' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '草本集' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '档案馆' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '园主' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '技能工坊' })).toHaveCount(0)
  })

  test('页脚含技能工坊与资源次级入口', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('.sg-footer-links')
    await expect(footer.getByRole('link', { name: '技能工坊' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '资源' })).toBeVisible()
  })

  test('sitemap 与 robots 可访问', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')

    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Sitemap:')
  })
})

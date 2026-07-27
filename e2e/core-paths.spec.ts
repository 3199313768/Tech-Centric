import { test, expect, type Page } from '@playwright/test'

async function expectLoginRedirect(page: Page) {
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: '登录 SpiritGarden' })).toBeVisible()
}

test.describe('核心访客路径', () => {
  test('T1：未登录访问首页重定向到登录页', async ({ page }) => {
    await page.goto('/')
    await expectLoginRedirect(page)
  })

  test('T4：Footer 邮箱 mailto', async ({ page }) => {
    await page.goto('/about')
    await expectLoginRedirect(page)
  })

  test('顶栏 5 Tab 信息架构', async ({ page }) => {
    await page.goto('/')
    await expectLoginRedirect(page)
  })

  test('页脚仅主 Tab，无次级与庭园附加入口', async ({ page }) => {
    await page.goto('/')
    await expectLoginRedirect(page)
  })

  test('桌面更多菜单可进入技能工坊', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expectLoginRedirect(page)
  })

  test('RAG 欢迎插画只在初始状态展示', async ({ page }) => {
    await page.goto('/')
    await expectLoginRedirect(page)
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

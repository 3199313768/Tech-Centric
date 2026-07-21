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

  test('页脚仅主 Tab，无次级与庭园附加入口', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('.sg-footer-links')
    await expect(footer.getByRole('link', { name: '庭院' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '归档' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '草本集' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '档案馆' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '园主' })).toBeVisible()
    await expect(footer.getByRole('link', { name: '技能工坊' })).toHaveCount(0)
    await expect(footer.getByRole('link', { name: '资源' })).toHaveCount(0)
    await expect(footer.getByRole('link', { name: '展柜' })).toHaveCount(0)
    await expect(footer.getByRole('link', { name: '庭园志' })).toHaveCount(0)
    await expect(footer.getByRole('link', { name: '庭园度量' })).toHaveCount(0)
    await expect(footer.getByRole('link', { name: '工作台' })).toHaveCount(0)
  })

  test('桌面更多菜单可进入技能工坊', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const more = page.getByRole('button', { name: '更多' })
    await expect(more).toBeVisible()
    await more.click()
    await page.getByRole('menuitem', { name: '技能工坊' }).click()
    await expect(page).toHaveURL(/\/skills/)
  })

  test('RAG 欢迎插画只在初始状态展示', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '打开庭院导引' }).click()

    const illustration = page.getByTestId('rag-welcome-illustration')
    await expect(illustration).toBeVisible()

    await page.getByRole('button', { name: '问项目' }).click()
    await expect(illustration).toHaveCount(0)
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

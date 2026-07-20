import { test, expect, type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

async function gotoArchiveList(page: Page) {
  await page.goto('/projects')
  await expect(page.locator('.sg-page-skeleton')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '全部项目', level: 1 })).toBeVisible()
  await expect(page.locator('.sg-toolbar-row .sg-filter-bar')).toBeVisible()
}

async function openFirstProjectDetail(page: Page) {
  const card = page.locator('.sg-archive-featured, .sg-project-card').first()
  await expect(card).toBeVisible()
  const titleEl = card.locator('.sg-archive-featured__title, .sg-project-card__title')
  const projectTitle = (await titleEl.innerText()).trim()

  // Next.js 客户端路由不会触发 load；点击 body 避开「管理」按钮的 stopPropagation
  await expect(async () => {
    await card.locator('.sg-archive-featured__body, .sg-project-card__body').click()
    await expect(page).toHaveURL(/\/projects\/[^/?#]+/)
    await expect(page.locator('.sg-project-detail__hero')).toBeVisible()
  }).toPass()

  return projectTitle
}

test.describe('归档模块', () => {
  test('A1：顶栏进入归档列表', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '欢迎来到我的数字庭院' })).toBeVisible()

    await page.locator('nav.sg-nav').getByRole('link', { name: '归档', exact: true }).click()
    await expect(page).toHaveURL(/\/projects/)
    await expect(page.locator('.sg-page-skeleton')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: '全部项目', level: 1 })).toBeVisible()
    await expect(page.getByText('工艺档案室')).toBeVisible()
    await expect(page.getByText('项目总数')).toBeVisible()
  })

  test('A2：分类筛选可切换', async ({ page }) => {
    await gotoArchiveList(page)

    const filterBar = page.locator('.sg-toolbar-row .sg-filter-bar')
    const allChip = filterBar.getByRole('button', { name: '全部', exact: true })
    const featuredChip = filterBar.getByRole('button', { name: '精选', exact: true })
    const archiveShelf = page.locator('.sg-bento-archive')

    await expect(allChip).toHaveClass(/sg-filter-chip--active/)
    await expect(archiveShelf).not.toHaveClass(/sg-bento-archive--uniform/)

    await expect(async () => {
      await featuredChip.click()
      await expect(featuredChip).toHaveClass(/sg-filter-chip--active/)
      await expect(allChip).not.toHaveClass(/sg-filter-chip--active/)
    }).toPass()

    await expect(archiveShelf).toHaveClass(/sg-bento-archive--uniform/)
    await expect(
      page.getByText('暂无该分类下的项目').or(page.locator('.sg-project-card, .sg-archive-featured').first()),
    ).toBeVisible()
  })

  test('A3：项目卡片进入详情并返回', async ({ page }) => {
    await gotoArchiveList(page)

    const hasProject = (await page.locator('.sg-project-card, .sg-archive-featured').count()) > 0
    test.skip(!hasProject, '当前无公开项目数据，跳过详情路径')

    const projectTitle = await openFirstProjectDetail(page)

    await expect(page.getByRole('heading', { level: 1, name: projectTitle })).toBeVisible()
    await expect(page.getByRole('heading', { name: '业务痛点 / 核心功能' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '主导工作 / 核心贡献' })).toBeVisible()

    await page.getByRole('link', { name: '← 返回归档' }).click()
    await expect(page).toHaveURL(/\/projects\/?$/)
    await expect(page.getByRole('heading', { name: '全部项目', level: 1 })).toBeVisible()
  })

  test('A4：详情页元数据与联系区块', async ({ page, request }) => {
    await gotoArchiveList(page)

    const hasProject = (await page.locator('.sg-project-card, .sg-archive-featured').count()) > 0
    test.skip(!hasProject, '当前无公开项目数据，跳过详情元数据')

    await openFirstProjectDetail(page)

    await expect(page.locator('.sg-project-detail__hero')).toBeVisible()
    await expect(page.getByRole('heading', { name: '合作或内推' })).toBeVisible()

    const slug = page.url().split('/projects/')[1]?.replace(/\/$/, '')
    expect(slug).toBeTruthy()

    const detailResponse = await request.get(`/projects/${slug}`)
    expect(detailResponse.ok()).toBeTruthy()
  })
})

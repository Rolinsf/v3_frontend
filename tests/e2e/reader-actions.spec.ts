import { expect, test } from '@playwright/test'
import { login, resetClientState } from './helpers'

test.beforeEach(async ({ page }) => resetClientState(page))

test('登录 → 收藏作品 → 在我的书架中出现', async ({ page }) => {
  await login(page)
  await page.goto('/novels/rain-letter')
  await page.getByRole('button', { name: '加入书架' }).click()

  await page.goto('/account?section=reading')
  await expect(page.getByRole('heading', { name: '阅读管理' })).toBeVisible()
  await expect(page.getByRole('link', { name: '写给雨季的第七封信' })).toBeVisible()
})

test('发表评论 → 我的评论中出现 → 删除', async ({ page }) => {
  await login(page)
  await page.goto('/novels/rain-letter')
  await page.getByRole('button', { name: '发表评论' }).click()
  const content = `E2E 评论 ${Date.now()}`
  await page.getByPlaceholder('友善交流，也给不同的阅读感受留一点空间。').fill(content)
  await page.getByRole('button', { name: '发布评论' }).click()
  await expect(page.getByText(content)).toBeVisible()

  await page.goto('/account?section=comments')
  await expect(page.getByRole('heading', { name: '我的评论' })).toBeVisible()
  const entry = page.locator('article').filter({ hasText: content })
  await expect(entry).toBeVisible()
  page.once('dialog', dialog => dialog.accept())
  await entry.getByRole('button', { name: '删除' }).click()
  await expect(page.getByText(content)).toHaveCount(0)
})

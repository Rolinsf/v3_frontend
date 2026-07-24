import { expect, test } from '@playwright/test'
import { resetClientState } from './helpers'

test('首页 → 小说详情 → 章节阅读', async ({ page }) => {
  await resetClientState(page)

  await page.getByRole('link', { name: /写给雨季的第七封信/ }).first().click()
  await expect(page).toHaveURL(/\/novels\/rain-letter$/)
  await expect(page.getByRole('heading', { name: '写给雨季的第七封信' })).toBeVisible()

  await page.getByRole('link', { name: '开始阅读' }).click()
  await expect(page).toHaveURL(/\/novels\/rain-letter\/chapters\/ch-1$/)
  await expect(page.getByRole('heading', { name: '第一章 没有收件人的信' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '章节导航' })).toBeVisible()
})

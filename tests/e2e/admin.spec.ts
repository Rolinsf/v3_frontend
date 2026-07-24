import { expect, test } from '@playwright/test'
import { login, resetClientState } from './helpers'

test.beforeEach(async ({ page }) => resetClientState(page))

test('普通用户无法访问 /admin/**', async ({ page }) => {
  await login(page)
  const response = await page.goto('/admin/reports')
  expect(response?.status()).toBe(403)
  await expect(page.getByText(/仅管理员/)).toBeVisible()
})

test('管理员处理举报和审核', async ({ page }) => {
  await login(page, 'admin@rolinsf.local')

  await page.goto('/admin/reports')
  await expect(page.getByText('评论含有人身攻击内容')).toBeVisible()
  await page.getByRole('button', { name: '确认违规' }).click()
  await expect(page.getByText('评论含有人身攻击内容')).toHaveCount(0)

  await page.goto('/admin/reviews')
  await expect(page.getByText('月台尽头的蓝色邮筒')).toBeVisible()
  await page.getByRole('button', { name: '通过' }).first().click()
  await expect(page.getByText('月台尽头的蓝色邮筒')).toHaveCount(0)
})

import { expect, test } from '@playwright/test'
import { login, resetClientState } from './helpers'

test('手机宽度下完成阅读和创作入口导航', async ({ page }) => {
  await resetClientState(page)
  await login(page)

  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: '移动端主导航' })
  await expect(navigation).toBeVisible()
  await navigation.getByRole('link', { name: '书库' }).click()
  await expect(page).toHaveURL(/\/novels$/)

  await navigation.getByRole('link', { name: '创作' }).click()
  await expect(page).toHaveURL(/\/account\?section=works/)
  await expect(page.getByRole('heading', { name: '我的作品' })).toBeVisible()

  await page.goto('/novels/rain-letter/chapters/ch-1')
  await expect(page.getByRole('navigation', { name: '移动端主导航' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '阅读设置' })).toBeVisible()
})

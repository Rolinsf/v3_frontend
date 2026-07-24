import { expect, type Page } from '@playwright/test'

export async function resetClientState(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
}

export async function login(page: Page, identifier = 'reader@example.com') {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /邮箱或手机号/ }).fill(identifier)
  await page.getByLabel('密码').fill('reader123')
  await page.locator('input[name="agree"]').check()
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

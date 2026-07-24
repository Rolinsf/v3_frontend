import { expect, test } from '@playwright/test'
import { login, resetClientState } from './helpers'

test('创建作品 → 新建章节 → 保存草稿 → 发布', async ({ page }) => {
  await resetClientState(page)
  await login(page, 'author@example.com')
  await page.goto('/creator/novels/new')

  const novelTitle = `E2E 测试作品 ${Date.now()}`
  await page.getByPlaceholder('给故事一个名字').fill(novelTitle)
  await page.getByPlaceholder('用一段话告诉读者这是什么故事').fill('这是一段用于端到端测试的完整作品简介，覆盖创建作品和发布章节的关键流程。')
  const categorySelects = page.locator('.category-selector select')
  await categorySelects.nth(0).selectOption('cat-daily')
  await categorySelects.nth(1).selectOption('cat-daily-campus')
  await page.getByRole('button', { name: '保存作品' }).click()

  await expect(page.getByRole('heading', { name: novelTitle })).toBeVisible()
  await page.getByRole('button', { name: '新增章节' }).click()
  await page.getByPlaceholder('章节标题').fill('第一章 E2E 旅程')
  await page.locator('[contenteditable="true"]').fill('这是用于验证章节草稿保存与发布流程的正文内容，长度足以通过基础校验。')
  await page.getByRole('button', { name: '保存草稿' }).click()
  await expect(page.getByText('已保存')).toBeVisible()

  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '发布', exact: true }).click()
  await expect(page).toHaveURL(/\/creator\/novels\/[^/]+\/chapters$/)
  await expect(page.getByText('第一章 E2E 旅程')).toBeVisible()
  await expect(page.getByText(/已发布/)).toBeVisible()
})

// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { chapterDraftSchema, creatorNovelSchema } from '~/schemas/creator'
import { inspectChapter } from '~/utils/chapter-publish'

describe('creator schemas', () => {
  it('requires a complete two-level category path', () => {
    const result = creatorNovelSchema.safeParse({
      title: '雨季来信',
      synopsis: '这是一段足够长的作品简介，用于说明故事、人物和基本冲突。',
      primaryCategoryId: 'cat-daily',
      secondaryCategoryId: '',
      status: 'draft'
    })
    expect(result.success).toBe(false)
  })

  it('accepts a chapter with title and meaningful body', () => {
    expect(chapterDraftSchema.safeParse({
      title: '第一章 雨中的旧图书馆',
      plainText: '雨从清晨开始落下，连廊尽头的旧图书馆像一封尚未拆开的信。'
    }).success).toBe(true)
  })
})

describe('chapter publish checks', () => {
  it('blocks missing title and too-short content', () => {
    const checks = inspectChapter('', '太短')
    expect(checks.filter(check => check.severity === 'error').map(check => check.id)).toEqual(['title', 'wordCount'])
  })

  it('warns about sensitive terms and empty paragraphs without blocking publish', () => {
    const checks = inspectChapter('第一章 雨夜', `这是一个包含自杀议题、需要作者复核语境的段落。\n\n${'正文内容'.repeat(130)}`)
    expect(checks.find(check => check.id === 'sensitive')?.severity).toBe('warning')
    expect(checks.find(check => check.id === 'emptyParagraphs')?.severity).toBe('warning')
    expect(checks.some(check => check.severity === 'error')).toBe(false)
  })
})

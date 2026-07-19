// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { chapterDraftSchema, creatorNovelSchema } from '~/schemas/creator'

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

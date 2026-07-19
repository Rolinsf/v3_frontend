// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { commentContentError, commentContentSchema } from '~/schemas/comment'

describe('commentContentSchema', () => {
  it('accepts a normal public comment', () => {
    expect(commentContentSchema.safeParse('这一章的留白很舒服。').success).toBe(true)
  })

  it('rejects empty and oversized content', () => {
    expect(commentContentError(' ')).toBe('至少写 2 个字。')
    expect(commentContentSchema.safeParse('字'.repeat(1001)).success).toBe(false)
  })
})

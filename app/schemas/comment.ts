import { z } from 'zod'

export const commentContentSchema = z.string()
  .trim()
  .min(2, '至少写 2 个字。')
  .max(1000, '评论不能超过 1000 个字。')

export function commentContentError(value: string) {
  const result = commentContentSchema.safeParse(value)
  return result.success ? '' : result.error.issues[0]?.message ?? '评论内容有误。'
}

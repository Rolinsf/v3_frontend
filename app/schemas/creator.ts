import { z } from 'zod'

export const creatorNovelSchema = z.object({
  title: z.string().trim().min(2, '书名至少 2 个字。').max(60, '书名不能超过 60 个字。'),
  synopsis: z.string().trim().min(20, '简介至少 20 个字。').max(1000, '简介不能超过 1000 个字。'),
  primaryCategoryId: z.string().min(1, '请选择一级分类。'),
  secondaryCategoryId: z.string().min(1, '请选择二级分类。'),
  status: z.enum(['draft', 'serializing', 'completed'])
})

export const chapterDraftSchema = z.object({
  title: z.string().trim().min(2, '章节标题至少 2 个字。').max(100, '章节标题不能超过 100 个字。'),
  plainText: z.string().trim().min(20, '正文至少 20 个字。')
})

export const schedulePublishSchema = z.object({
  scheduledAt: z.string().refine(value => new Date(value).getTime() > Date.now(), '定时发布时间必须晚于现在。')
})

export function schemaErrors(error: z.ZodError) {
  return Object.fromEntries(error.issues.map(issue => [String(issue.path[0] ?? 'form'), issue.message]))
}

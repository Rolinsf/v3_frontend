import { z } from 'zod'
import { requireServerAdmin } from '../../utils/session'

const actionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('review'), id: z.string().min(1), status: z.enum(['approved', 'rejected']) }),
  z.object({ kind: z.literal('report'), id: z.string().min(1), status: z.enum(['resolved', 'dismissed']) }),
  z.object({ kind: z.literal('ban'), id: z.string().min(1), banned: z.boolean(), reason: z.string().trim().max(500).optional() })
])

export default defineEventHandler(async (event) => {
  const admin = requireServerAdmin(event)
  const action = await readValidatedBody(event, body => actionSchema.parse(body))
  const storage = useStorage('data')
  await storage.setItem(`moderation:${action.kind}:${action.id}`, {
    ...action,
    actorId: admin.id,
    updatedAt: new Date().toISOString()
  })
  return { accepted: true, actorId: admin.id, action }
})

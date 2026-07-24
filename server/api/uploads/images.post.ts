import { randomUUID } from 'node:crypto'
import { inspectImage } from '../../utils/image'
import { requireServerUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const user = requireServerUser(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  if (!file?.filename || !file.type) throw createError({ statusCode: 400, statusMessage: '缺少图片文件' })
  const image = inspectImage(file.data, file.type, file.filename)
  const id = randomUUID()
  const storage = useStorage('uploads')
  await storage.setItemRaw(`images:${id}:data`, file.data)
  await storage.setItem(`images:${id}:meta`, { ownerId: user.id, ...image })
  return { id, url: `/api/uploads/images/${id}`, ...image }
})

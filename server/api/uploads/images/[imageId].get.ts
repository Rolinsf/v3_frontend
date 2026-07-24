export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'imageId')
  if (!imageId || !/^[0-9a-f-]{36}$/i.test(imageId)) throw createError({ statusCode: 400, statusMessage: '图片 ID 无效' })
  const storage = useStorage('uploads')
  const meta = await storage.getItem<{ mime: string }>(`images:${imageId}:meta`)
  const data = await storage.getItemRaw<Buffer>(`images:${imageId}:data`)
  if (!meta || !data) throw createError({ statusCode: 404, statusMessage: '图片不存在' })
  setHeader(event, 'Content-Type', meta.mime)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  return data
})

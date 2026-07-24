export const IMAGE_LIMITS = {
  bytes: 2 * 1024 * 1024,
  maxWidth: 2400,
  maxHeight: 3200,
  minWidth: 300,
  minHeight: 400
} as const

const ALLOWED = new Map([
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
  ['image/webp', ['webp']]
])

function jpegSize(data: Buffer) {
  let offset = 2
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) break
    const marker = data[offset + 1]!
    const length = data.readUInt16BE(offset + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) }
    }
    offset += 2 + length
  }
}

export function inspectImage(data: Buffer, mime: string, filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED.get(mime)?.includes(extension)) throw createError({ statusCode: 415, statusMessage: '仅支持 JPG、PNG 或 WebP' })
  if (!data.length || data.length > IMAGE_LIMITS.bytes) throw createError({ statusCode: 413, statusMessage: '图片不能超过 2MB' })
  let detected: string | undefined
  let size: { width: number, height: number } | undefined
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && data.length >= 24) {
    detected = 'image/png'
    size = { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  } else if (data[0] === 0xff && data[1] === 0xd8) {
    detected = 'image/jpeg'
    size = jpegSize(data)
  } else if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    detected = 'image/webp'
    const type = data.toString('ascii', 12, 16)
    if (type === 'VP8X' && data.length >= 30) size = { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) }
  }
  if (detected !== mime || !size) throw createError({ statusCode: 415, statusMessage: '图片内容与声明格式不一致或文件已损坏' })
  if (size.width < IMAGE_LIMITS.minWidth || size.height < IMAGE_LIMITS.minHeight || size.width > IMAGE_LIMITS.maxWidth || size.height > IMAGE_LIMITS.maxHeight) {
    throw createError({ statusCode: 422, statusMessage: `图片尺寸需在 ${IMAGE_LIMITS.minWidth}×${IMAGE_LIMITS.minHeight} 至 ${IMAGE_LIMITS.maxWidth}×${IMAGE_LIMITS.maxHeight} 像素之间` })
  }
  return { mime: detected, ...size }
}

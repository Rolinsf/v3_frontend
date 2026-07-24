const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export async function validateCoverImage(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const validExtension = file.type === 'image/jpeg' ? ['jpg', 'jpeg'].includes(extension ?? '') : extension === file.type.split('/')[1]
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !validExtension) throw new Error('仅支持 JPG、PNG 或 WebP 图片。')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('封面图片不能超过 2MB。')
  const url = URL.createObjectURL(file)
  try {
    const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
      image.onerror = () => reject(new Error('图片已损坏或无法读取。'))
      image.src = url
    })
    if (dimensions.width < 300 || dimensions.height < 400 || dimensions.width > 2400 || dimensions.height > 3200) {
      throw new Error('封面尺寸需在 300×400 至 2400×3200 像素之间。')
    }
    return dimensions
  } finally {
    URL.revokeObjectURL(url)
  }
}

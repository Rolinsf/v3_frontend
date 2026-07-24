import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export interface ServerUser {
  id: string
  role: 'reader' | 'admin'
}

function secret(event: H3Event): string {
  const value = useRuntimeConfig(event).sessionSecret
  if (typeof value !== 'string' || value.length < 32) {
    throw createError({ statusCode: 503, statusMessage: '服务端认证尚未配置' })
  }
  return value
}

export function requireServerUser(event: H3Event): ServerUser {
  const cookie = getCookie(event, 'wakabayashi-session')
  if (!cookie) throw createError({ statusCode: 401, statusMessage: '请先登录' })
  const [payload, signature] = cookie.split('.')
  if (!payload || !signature) throw createError({ statusCode: 401, statusMessage: '会话无效' })
  const expected = createHmac('sha256', secret(event)).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw createError({ statusCode: 401, statusMessage: '会话无效' })
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ServerUser & { expiresAt: number }
    if (!parsed.id || parsed.expiresAt <= Date.now()) throw new Error()
    return { id: parsed.id, role: parsed.role }
  } catch {
    throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  }
}

export function requireServerAdmin(event: H3Event): ServerUser {
  const user = requireServerUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: '需要管理员权限' })
  return user
}

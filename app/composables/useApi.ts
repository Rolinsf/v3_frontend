import type { ZodType } from 'zod'
import type { ApiError, ApiSuccess } from '~/types/api'
import { toApiError } from '~/types/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type ApiBody = Record<string, unknown> | BodyInit | null
interface ApiRequestOptions<T> {
  method?: HttpMethod
  query?: Record<string, unknown>
  body?: ApiBody
  schema?: ZodType<T>
  timeoutMs?: number
  retries?: number
  headers?: Record<string, string>
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

/** 全站唯一 HTTP 客户端：Session Cookie、超时、重试、错误与响应校验统一在此处理。 */
export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function request<T>(url: string, options: ApiRequestOptions<T> = {}): Promise<T> {
    const method = options.method ?? 'GET'
    const maxRetries = method === 'GET' ? (options.retries ?? 2) : 0
    let attempt = 0
    while (true) {
      try {
        const response = await $fetch<ApiSuccess<unknown>>(url, {
          baseURL: config.public.apiBase,
          method,
          query: options.query,
          body: options.body,
          headers: { accept: 'application/json', ...options.headers },
          credentials: 'include',
          signal: AbortSignal.timeout(options.timeoutMs ?? 12000)
        })
        const payload = response?.data
        if (!options.schema) return payload as T
        const parsed = options.schema.safeParse(payload)
        if (!parsed.success) {
          throw <ApiError>{ code: 'invalid_response', statusCode: 502, message: '服务返回的数据格式异常。', detail: parsed.error.message }
        }
        return parsed.data
      } catch (error) {
        const normalized = normalizeFetchError(error)
        if (normalized.code === 'unauthorized' && import.meta.client) auth.logout()
        const retryable = normalized.code === 'network' || normalized.code === 'timeout' || RETRYABLE_STATUS.has(normalized.statusCode)
        if (!retryable || attempt >= maxRetries) throw normalized
        await new Promise(resolve => setTimeout(resolve, 300 * 2 ** attempt))
        attempt += 1
      }
    }
  }

  return {
    request,
    get: <T>(url: string, options: Omit<ApiRequestOptions<T>, 'method' | 'body'> = {}) => request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body?: ApiBody, options: Omit<ApiRequestOptions<T>, 'method' | 'body'> = {}) => request<T>(url, { ...options, method: 'POST', body }),
    put: <T>(url: string, body?: ApiBody, options: Omit<ApiRequestOptions<T>, 'method' | 'body'> = {}) => request<T>(url, { ...options, method: 'PUT', body }),
    patch: <T>(url: string, body?: ApiBody, options: Omit<ApiRequestOptions<T>, 'method' | 'body'> = {}) => request<T>(url, { ...options, method: 'PATCH', body }),
    delete: <T>(url: string, options: Omit<ApiRequestOptions<T>, 'method' | 'body'> = {}) => request<T>(url, { ...options, method: 'DELETE' })
  }
}

interface FetchErrorLike { statusCode?: number, status?: number, statusMessage?: string, data?: { message?: string, fieldErrors?: Record<string, string[]> } }

export function normalizeFetchError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'code' in error && 'statusCode' in error) return error as ApiError
  if (error instanceof DOMException && error.name === 'TimeoutError') return { code: 'timeout', statusCode: 408, message: '请求超时，请稍后重试。' }
  if (typeof error === 'object' && error !== null && ('statusCode' in error || 'status' in error)) {
    const value = error as FetchErrorLike
    const statusCode = value.statusCode ?? value.status ?? 0
    const code: ApiError['code'] = statusCode === 401 ? 'unauthorized' : statusCode === 403 ? 'forbidden' : statusCode === 404 ? 'not_found' : statusCode === 422 ? 'validation' : statusCode === 429 ? 'rate_limited' : statusCode >= 500 ? 'server_error' : 'unknown'
    return { code, statusCode, message: userMessageFor(code, value.data?.message ?? value.statusMessage), detail: value.statusMessage, fieldErrors: value.data?.fieldErrors }
  }
  if (error instanceof Error && /abort|timeout/i.test(error.message)) return { code: 'timeout', statusCode: 408, message: '请求超时，请稍后重试。', detail: error.message }
  if (error instanceof Error && /fetch|network|load failed/i.test(error.message)) return { code: 'network', statusCode: 0, message: '网络连接异常，请检查后再试。', detail: error.message }
  return toApiError(error)
}

function userMessageFor(code: ApiError['code'], fallback?: string) {
  const messages: Partial<Record<ApiError['code'], string>> = {
    unauthorized: '登录状态已失效，请重新登录。', forbidden: '你没有执行此操作的权限。',
    not_found: '请求的内容不存在或已被删除。', validation: '提交内容有误，请检查后再试。',
    rate_limited: '操作过于频繁，请稍后再试。', server_error: '服务器暂时无法响应，请稍后重试。',
    invalid_response: '服务返回的数据格式异常。', timeout: '请求超时，请稍后重试。'
  }
  return fallback ?? messages[code] ?? '发生未知错误，请稍后重试。'
}

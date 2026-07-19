// API 通用响应类型：所有数据 composable 与 fixtures 都通过这些类型与页面解耦。
// 真实 API 接入后（阶段 8），只需在 useApi 中按这套契约解析响应即可。

/** API 业务错误码：与后端约定，前端据此决定提示文案与重试策略。 */
export type ApiErrorCode
  = | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'validation'
    | 'rate_limited'
    | 'server_error'
    | 'network'
    | 'invalid_response'
    | 'timeout'
    | 'unknown'

/** API 错误：携带错误码、HTTP 状态、用户可读消息和可选调试信息。 */
export interface ApiError {
  code: ApiErrorCode
  statusCode: number
  /** 用户可读的错误消息（中文）。 */
  message: string
  /** 调试用细节，不直接展示给终端用户。 */
  detail?: string
  /** 字段级校验错误，例如登录表单。 */
  fieldErrors?: Record<string, string[]>
}

/** 成功响应载荷。 */
export interface ApiSuccess<T> {
  data: T
  requestId?: string
}

/** 分页结果。 */
export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  /** 是否还有下一页。 */
  hasMore: boolean
}

/** 列表查询参数：用于书库、搜索、排行、评论列表等。 */
export interface ListQuery {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/** 统一返回类型：成功返回数据，失败返回 ApiError。 */
export type ApiResult<T> = { ok: true, data: T } | { ok: false, error: ApiError }

/** 把未知异常归一化为 ApiError。供 useApi 内部使用。 */
export function toApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return error as ApiError
  }
  return {
    code: 'unknown',
    statusCode: 0,
    message: '发生未知错误，请稍后重试。',
    detail: String(error)
  }
}

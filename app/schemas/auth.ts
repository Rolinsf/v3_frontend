// 认证表单的 Zod Schema：阶段 4 的登录/注册表单使用同一套校验规则。
// 阶段 8 接入真实 API 时，后端返回的错误会以 ApiError.fieldErrors 形式合并到表单。
//
// 标识符同时支持邮箱和手机号：
// - 邮箱：标准 RFC 邮箱格式
// - 手机号：中国大陆 11 位手机号（以 1 开头），第二位为 3-9
//
// 密码策略：8-64 字符，至少包含字母与数字，避免弱口令。
// 不强制大小写+符号+特殊字符，因为本项目面向小圈子用户，过严的策略会驱赶读者。

import { z } from 'zod'

const identifierSchema = z
  .string()
  .min(1, '请输入邮箱或手机号')
  .refine(
    v => isEmail(v) || isCnMobile(v),
    '请输入有效的邮箱或手机号'
  )

const passwordSchema = z
  .string()
  .min(8, '密码至少 8 位')
  .max(64, '密码最多 64 位')
  .refine(
    v => /[a-zA-Z]/.test(v) && /\d/.test(v),
    '密码需同时包含字母和数字'
  )

const nameSchema = z
  .string()
  .min(2, '昵称至少 2 个字符')
  .max(20, '昵称最多 20 个字符')

const agreeSchema = z
  .boolean()
  .refine(v => v === true, '请先阅读并同意用户协议与隐私政策')

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  agree: agreeSchema
})

export const registerSchema = z.object({
  identifier: identifierSchema,
  name: nameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, '请再次输入密码'),
  agree: agreeSchema
}).refine(
  data => data.password === data.confirmPassword,
  { message: '两次输入的密码不一致', path: ['confirmPassword'] }
)

/** 把 Zod 错误归一化为字段->消息映射，供表单字段旁展示。 */
export function zodErrors(error: unknown): Record<string, string> {
  if (error instanceof z.ZodError) {
    const result: Record<string, string> = {}
    for (const issue of error.issues) {
      const key = issue.path[0]?.toString()
      if (!key) continue
      // 只保留首个错误，避免字段下方堆叠多行
      if (!result[key]) result[key] = issue.message
    }
    return result
  }
  return {}
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isCnMobile(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

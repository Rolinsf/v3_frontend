// 认证相关类型：登录/注册表单、当前用户视图。
// 真实 API 接入后（阶段 8），后端返回的用户对象会映射为 AuthUser，
// 字段命名与 useApi 的契约保持一致，不直接耦合服务端ORM。

import type { UserRole } from './user'

/** 当前登录用户的视图对象：不含密码、令牌等敏感字段。 */
export interface AuthUser {
  id: string
  /** 登录账号：邮箱或手机号，仅用于显示与注销提示。 */
  identifier: string
  /** 昵称：注册时由用户提供，后续可在账户中心修改。 */
  name: string
  /** 头像 URL；为空时由前端用首字母占位。 */
  avatarUrl?: string
  role: UserRole
  /** 登录时间戳：用于会话过期提示与日志，不用于安全判断。 */
  loggedAt: string
}

export type AuthMode = 'login' | 'register'

/** 登录表单：标识符支持邮箱或手机号。 */
export interface LoginForm {
  identifier: string
  password: string
  /** 用户协议与隐私政策同意勾选。 */
  agree: boolean
}

/** 注册表单：注册时需要确认密码。 */
export interface RegisterForm {
  identifier: string
  name: string
  password: string
  confirmPassword: string
  agree: boolean
}

/** 来源页回跳意图：保存触发登录的来源路径与可选操作，登录成功后恢复。 */
export interface LoginIntent {
  /** 登录成功后要返回的路径（含 query）。 */
  redirect?: string
  /** 触发登录的操作类型，例如 bookshelf、comment、like。 */
  action?: string
  /** 操作目标 id，例如小说 id 或章节 id。 */
  targetId?: string
}

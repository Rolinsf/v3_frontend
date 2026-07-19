// 认证 Pinia store：阶段 4 仅使用 fixtures mock 登录，登录态保存在 localStorage。
// 阶段 8 接入真实 API 后：
//   - login/register 改为调用 useApi().post('/auth/login', ...)
//   - 服务端通过 Secure/HttpOnly/SameSite Cookie 维护会话
//   - fetchUser 在 SSR 时读取 Cookie 并初始化 user
//   - 不再在 localStorage 保存任何用户标识
//
// 安全说明：fixtures 阶段保存的只是 mock 用户对象（不含密码、不含令牌），
// 仅用于前端 UI 切换，绝不能误解为真实会话凭据。

import { defineStore } from 'pinia'
import type { AuthUser, LoginIntent } from '~/types/auth'

const STORAGE_KEY = 'wakabayashi-auth-user'
const INTENT_KEY = 'wakabayashi-login-intent'
const RESUMED_INTENT_KEY = 'wakabayashi-resumed-intent'

/** 把标识符转为稳定的 mock 用户 id（不是真实用户体系）。 */
function deriveMockId(identifier: string): string {
  // 简单 hash：不要求加密强度，只要相同输入产生相同 id 即可
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash * 31 + identifier.charCodeAt(i)) | 0
  }
  return `u-${Math.abs(hash).toString(36)}`
}

/** 从标识符生成默认昵称：邮箱取 @ 前段，手机号脱敏。 */
function deriveDefaultName(identifier: string): string {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    const local = identifier.split('@')[0]!
    return local.length > 8 ? `${local.slice(0, 8)}…` : local
  }
  if (/^1[3-9]\d{9}$/.test(identifier)) {
    return `读者 ${identifier.slice(-4)}`
  }
  return '若林读者'
}

export const useAuthStore = defineStore('auth', () => {
  // SSR 阶段保持 null；客户端在 plugin 中从 localStorage 注水。
  const user = ref<AuthUser | null>(null)
  const pending = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  /** 客户端注水：从 localStorage 读取上次保存的 mock 用户。 */
  function hydrate() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AuthUser
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.identifier) {
        user.value = parsed
      }
    } catch {
      // 损坏的本地数据直接忽略
    }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      if (user.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // 隐私模式或容量超限：静默失败，不影响登录流程
    }
  }

  /**
   * Mock 登录：阶段 4 不接后端，只要校验通过就签发 mock 用户。
   * 阶段 8 替换为 await useApi().post<AuthUser>('/auth/login', payload)。
   */
  async function login(identifier: string): Promise<AuthUser> {
    pending.value = true
    try {
      // 模拟网络延迟，便于展示 pending 状态
      await new Promise(resolve => setTimeout(resolve, 300))
      const now = new Date().toISOString()
      const mock: AuthUser = {
        id: deriveMockId(identifier),
        identifier,
        name: deriveDefaultName(identifier),
        role: identifier.trim().toLowerCase() === 'admin@rolinsf.local' ? 'admin' : 'reader',
        loggedAt: now
      }
      user.value = mock
      persist()
      return mock
    } finally {
      pending.value = false
    }
  }

  /**
   * Mock 注册：与 login 类似，但使用用户提供的昵称。
   * 阶段 8 替换为 await useApi().post<AuthUser>('/auth/register', payload)。
   */
  async function register(identifier: string, name: string): Promise<AuthUser> {
    pending.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const now = new Date().toISOString()
      const mock: AuthUser = {
        id: deriveMockId(identifier),
        identifier,
        name: name.trim(),
        role: 'reader',
        loggedAt: now
      }
      user.value = mock
      persist()
      return mock
    } finally {
      pending.value = false
    }
  }

  /** 注销：清除用户态与本地存储；不在此处清除阅读进度等访客数据。 */
  function logout() {
    user.value = null
    persist()
  }

  function updateProfile(input: { name: string, avatarUrl?: string }) {
    if (!user.value) return
    user.value = { ...user.value, name: input.name.trim() || user.value.name, avatarUrl: input.avatarUrl?.trim() || undefined }
    persist()
  }

  // ----- 来源页回跳意图 -----

  /** 保存登录意图，登录成功后由页面读取并恢复操作。 */
  function saveIntent(intent: LoginIntent) {
    if (!import.meta.client) return
    try {
      localStorage.setItem(INTENT_KEY, JSON.stringify(intent))
    } catch {
      // 隐私模式下静默失败，登录页通过 URL query 仍可回跳
    }
  }

  /** 读取并清除登录意图：调用方负责执行回跳或操作恢复。 */
  function consumeIntent(): LoginIntent | null {
    if (!import.meta.client) return null
    try {
      const raw = localStorage.getItem(INTENT_KEY)
      if (!raw) return null
      localStorage.removeItem(INTENT_KEY)
      return JSON.parse(raw) as LoginIntent
    } catch {
      return null
    }
  }

  /** 登录页把已完成认证的操作意图转存为一次性恢复数据。 */
  function resumeIntent(intent: LoginIntent) {
    if (!import.meta.client) return
    sessionStorage.setItem(RESUMED_INTENT_KEY, JSON.stringify(intent))
  }

  function consumeResumedIntent(): LoginIntent | null {
    if (!import.meta.client) return null
    try {
      const raw = sessionStorage.getItem(RESUMED_INTENT_KEY)
      if (!raw) return null
      sessionStorage.removeItem(RESUMED_INTENT_KEY)
      return JSON.parse(raw) as LoginIntent
    } catch {
      return null
    }
  }

  function peekResumedIntent(): LoginIntent | null {
    if (!import.meta.client) return null
    try {
      const raw = sessionStorage.getItem(RESUMED_INTENT_KEY)
      return raw ? JSON.parse(raw) as LoginIntent : null
    } catch {
      return null
    }
  }

  function clearResumedIntent() {
    if (import.meta.client) sessionStorage.removeItem(RESUMED_INTENT_KEY)
  }

  return {
    user,
    pending,
    isLoggedIn,
    hydrate,
    login,
    register,
    logout,
    updateProfile,
    saveIntent,
    consumeIntent,
    resumeIntent,
    consumeResumedIntent,
    peekResumedIntent,
    clearResumedIntent
  }
})

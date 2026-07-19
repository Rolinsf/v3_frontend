// 要求登录的路由中间件：未登录时跳转 /login，并保存来源页与意图。
// 注意：本中间件只负责"体验层"拦截，阶段 8 后端接口仍会再次校验登录态。
//
// 跳转 /login 时通过 URL query 携带 redirect（避免 history 暴露意图细节），
// 同时通过 store.saveIntent 保存 action/targetId 等更细粒度信息。
// 登录页成功后会优先读取 store 中的 intent 恢复操作。

import type { LoginIntent } from '~/types/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (auth.isLoggedIn) return

  const intent: LoginIntent = {
    redirect: to.fullPath,
    action: (to.query.action as string) || undefined,
    targetId: (to.query.targetId as string) || undefined
  }
  auth.saveIntent(intent)

  return navigateTo({
    path: '/login',
    query: { redirect: to.fullPath }
  })
})

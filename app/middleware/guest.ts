// 仅未登录用户可访问的路由中间件：
// 已登录用户访问 /login 或 /register 时直接回到首页，避免重复登录。
// 行为类似 Laravel 的 guest 中间件。

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return

  // 优先恢复登录前保存的意图；没有则回到首页
  const intent = auth.consumeIntent()
  return navigateTo(intent?.redirect || '/')
})

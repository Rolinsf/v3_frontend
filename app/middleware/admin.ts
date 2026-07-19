// 管理后台体验层守卫。真实权限必须由阶段 8 后端在每个管理接口再次校验。
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    auth.saveIntent({ redirect: to.fullPath, action: 'admin' })
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (auth.user?.role !== 'admin') {
    return abortNavigation(createError({ statusCode: 403, statusMessage: '仅管理员可以访问此页面' }))
  }
})

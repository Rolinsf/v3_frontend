// 客户端启动时从 localStorage 注水认证 store。
// 阶段 8 接入真实会话后，改为在 SSR 阶段通过 Cookie 初始化 user，
// 并删除此文件。

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const progressSync = useReadingProgressSync()
  auth.hydrate()

  watch(
    () => auth.user?.id,
    (userId) => {
      if (userId) progressSync.start(userId)
      else progressSync.stop()
    },
    { immediate: true }
  )
})

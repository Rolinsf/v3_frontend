// 客户端启动时从 localStorage 注水认证 store。
// 阶段 8 接入真实会话后，改为在 SSR 阶段通过 Cookie 初始化 user，
// 并删除此文件。

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const progressSync = useReadingProgressSync()
  const bookshelfSync = useBookshelfSyncStore()
  const account = useAccountStore()
  auth.hydrate()
  account.initialize()

  watch(
    [() => auth.user?.id, () => account.preferences.reading.syncProgress],
    ([userId, syncEnabled]) => {
      if (userId && syncEnabled) {
        progressSync.start(userId)
        bookshelfSync.start(userId)
      } else {
        progressSync.stop()
        bookshelfSync.stop()
      }
    },
    { immediate: true }
  )
})

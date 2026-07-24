export default defineNuxtPlugin(() => {
  const reader = useReaderStore()
  reader.initialize()
  watch([
    () => reader.fontSize,
    () => reader.lineHeight,
    () => reader.pageWidth,
    () => reader.theme,
    () => reader.font,
    () => reader.autoAdvance
  ], reader.persist)

  useReadingProgressStore().initialize()
  useBookshelfStore().initialize()
  useFollowingStore().initialize()
  useCommentsStore().initialize()
  useCreatorStore().initialize()
  useAdminStore().initialize()
  useAccountStore().initialize()
})

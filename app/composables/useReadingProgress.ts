export function useReadingProgress() {
  const store = useReadingProgressStore()
  const { progressList } = storeToRefs(store)
  return {
    progressList,
    initialize: store.initialize,
    getProgress: store.getProgress,
    getReadChapterIds: store.getReadChapterIds,
    isChapterRead: store.isChapterRead,
    saveProgress: store.saveProgress,
    clearProgress: store.clearProgress,
    clearAllProgress: store.clearAllProgress,
    replaceAllProgress: store.replaceAllProgress
  }
}

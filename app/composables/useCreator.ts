export function useCreator() {
  const store = useCreatorStore()
  const { novels, drafts, versions, initialized } = storeToRefs(store)
  return {
    novels, drafts, versions, initialized,
    initialize: store.initialize,
    ownedNovels: store.ownedNovels,
    getNovel: store.getNovel,
    saveNovel: store.saveNovel,
    addVolume: store.addVolume,
    addChapter: store.addChapter,
    saveDraft: store.saveDraft,
    publishChapter: store.publishChapter,
    withdrawChapter: store.withdrawChapter,
    reorderChapter: store.reorderChapter,
    getVersions: store.getVersions
  }
}

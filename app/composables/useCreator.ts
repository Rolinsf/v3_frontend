export function useCreator() {
  const store = useCreatorStore()
  const { novels, drafts, initialized } = storeToRefs(store)
  return {
    novels, drafts, initialized,
    initialize: store.initialize,
    ownedNovels: store.ownedNovels,
    getNovel: store.getNovel,
    saveNovel: store.saveNovel,
    addVolume: store.addVolume,
    addChapter: store.addChapter,
    saveDraft: store.saveDraft,
    publishChapter: store.publishChapter
  }
}

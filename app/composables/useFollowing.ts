export function useFollowing() {
  const store = useFollowingStore()
  return {
    authors: computed(() => store.authors),
    novels: computed(() => store.novels),
    isFollowingAuthor: store.isFollowingAuthor,
    toggleAuthor: store.toggleAuthor,
    getNovelPreference: store.getNovelPreference,
    setNovelNotifications: store.setNovelNotifications,
    markUpdateSeen: store.markUpdateSeen,
    unreadCount: store.unreadCount
  }
}

export function useComments() {
  const store = useCommentsStore()
  const { comments, notifications, unreadCount } = storeToRefs(store)
  return {
    comments, notifications, unreadCount,
    initialize: store.initialize,
    list: store.list,
    addComment: store.addComment,
    addReply: store.addReply,
    toggleLike: store.toggleLike,
    deleteEntry: store.deleteEntry,
    report: store.report,
    markAllRead: store.markAllRead,
    myEntries: store.myEntries
  }
}

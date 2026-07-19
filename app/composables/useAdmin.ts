export function useAdmin() {
  const store = useAdminStore()
  const { data, pendingReviews, pendingReports } = storeToRefs(store)
  return {
    data, pendingReviews, pendingReports,
    initialize: store.initialize,
    addPrimary: store.addPrimary,
    addSecondary: store.addSecondary,
    toggleCategory: store.toggleCategory,
    addTag: store.addTag,
    toggleTag: store.toggleTag,
    review: store.review,
    resolveReport: store.resolveReport,
    setBan: store.setBan
  }
}

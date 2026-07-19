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
    saveFooterSettings: store.saveFooterSettings,
    addFooterLink: store.addFooterLink,
    updateFooterLink: store.updateFooterLink,
    deleteFooterLink: store.deleteFooterLink,
    toggleFooterLink: store.toggleFooterLink,
    addDiscoveryItem: store.addDiscoveryItem,
    updateDiscoveryItem: store.updateDiscoveryItem,
    deleteDiscoveryItem: store.deleteDiscoveryItem,
    toggleDiscoveryItem: store.toggleDiscoveryItem,
    review: store.review,
    resolveReport: store.resolveReport,
    setBan: store.setBan
  }
}

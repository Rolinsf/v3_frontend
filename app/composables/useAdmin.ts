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
    addActivity: store.addActivity,
    updateActivity: store.updateActivity,
    deleteActivity: store.deleteActivity,
    toggleActivity: store.toggleActivity,
    submitActivity: store.submitActivity,
    likeActivity: store.likeActivity,
    addAnnouncement: store.addAnnouncement,
    updateAnnouncement: store.updateAnnouncement,
    deleteAnnouncement: store.deleteAnnouncement,
    toggleAnnouncement: store.toggleAnnouncement,
    review: store.review,
    resolveReport: store.resolveReport,
    setBan: store.setBan
  }
}

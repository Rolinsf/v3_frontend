export function useBookshelf() {
  const store = useBookshelfStore()
  const { items, initialized } = storeToRefs(store)
  return {
    items,
    initialized,
    getStatus: store.getStatus,
    add: store.add,
    updateStatus: store.updateStatus,
    remove: store.remove
  }
}

export function useReadingProgressSync() {
  const store = useReadingProgressSyncStore()
  const { state, lastSyncedAt, errorMessage } = storeToRefs(store)
  return { state, lastSyncedAt, errorMessage, start: store.start, stop: store.stop }
}

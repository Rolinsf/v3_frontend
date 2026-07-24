import { defineStore } from 'pinia'
import type { BookshelfItem } from '~/types/bookshelf'
import { mergeBookshelfItems } from '~/utils/bookshelf'

const MOCK_CLOUD_PREFIX = 'wakabayashi-mock-cloud-bookshelf:'
type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

function readRemote(userId: string): BookshelfItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(`${MOCK_CLOUD_PREFIX}${userId}`) ?? '[]') as unknown
    return Array.isArray(value) ? value as BookshelfItem[] : []
  } catch {
    return []
  }
}

export const useBookshelfSyncStore = defineStore('bookshelf-sync', () => {
  const state = ref<SyncState>('idle')
  const lastSyncedAt = ref<string>()
  const errorMessage = ref<string>()
  let stopLocalWatch: (() => void) | undefined

  function writeRemote(userId: string, items: BookshelfItem[]) {
    localStorage.setItem(`${MOCK_CLOUD_PREFIX}${userId}`, JSON.stringify(items))
  }

  function stop() {
    stopLocalWatch?.()
    stopLocalWatch = undefined
    state.value = 'idle'
  }

  function start(userId: string) {
    if (!import.meta.client) return
    stop()
    state.value = 'syncing'
    errorMessage.value = undefined
    const bookshelf = useBookshelfStore()

    try {
      bookshelf.initialize()
      const merged = mergeBookshelfItems(bookshelf.items, readRemote(userId))
      bookshelf.replaceAll(merged)
      writeRemote(userId, merged)
      lastSyncedAt.value = new Date().toISOString()
      state.value = 'synced'
      stopLocalWatch = watch(() => bookshelf.items, (items) => {
        try {
          writeRemote(userId, items)
          lastSyncedAt.value = new Date().toISOString()
          state.value = 'synced'
          errorMessage.value = undefined
        } catch {
          state.value = 'error'
          errorMessage.value = '同步失败，本地书架已保留。'
        }
      }, { deep: true })
    } catch {
      state.value = 'error'
      errorMessage.value = '同步失败，本地书架已保留。'
    }
  }

  return { state, lastSyncedAt, errorMessage, start, stop }
})

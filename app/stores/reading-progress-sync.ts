import { defineStore } from 'pinia'
import type { ProgressMap } from '~/stores/reading-progress'
import { mergeReadingProgress } from '~/utils/reading-progress'

const MOCK_CLOUD_PREFIX = 'wakabayashi-mock-cloud-progress:'
type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

function readRemote(userId: string): ProgressMap {
  try {
    const value = JSON.parse(localStorage.getItem(`${MOCK_CLOUD_PREFIX}${userId}`) ?? '{}') as unknown
    return value && typeof value === 'object' && !Array.isArray(value) ? value as ProgressMap : {}
  } catch {
    return {}
  }
}

export const useReadingProgressSyncStore = defineStore('reading-progress-sync', () => {
  const state = ref<SyncState>('idle')
  const lastSyncedAt = ref<string>()
  const errorMessage = ref<string>()
  let stopLocalWatch: (() => void) | undefined

  function writeRemote(userId: string, progress: ProgressMap) {
    localStorage.setItem(`${MOCK_CLOUD_PREFIX}${userId}`, JSON.stringify(progress))
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
    const reading = useReadingProgressStore()
    try {
      reading.initialize()
      const local = Object.fromEntries(reading.progressList.map(item => [item.novelId, item]))
      const merged = mergeReadingProgress(local, readRemote(userId))
      reading.replaceAllProgress(merged)
      writeRemote(userId, merged)
      lastSyncedAt.value = new Date().toISOString()
      state.value = 'synced'
      stopLocalWatch = watch(() => reading.progressList, (list) => {
        try {
          writeRemote(userId, Object.fromEntries(list.map(item => [item.novelId, item])))
          lastSyncedAt.value = new Date().toISOString()
          state.value = 'synced'
          errorMessage.value = undefined
        } catch {
          state.value = 'error'
          errorMessage.value = '同步失败，本地阅读进度已保留。'
        }
      }, { deep: true })
    } catch {
      state.value = 'error'
      errorMessage.value = '同步失败，本地阅读进度已保留。'
    }
  }

  return { state, lastSyncedAt, errorMessage, start, stop }
})

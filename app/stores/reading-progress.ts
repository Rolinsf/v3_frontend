import { defineStore } from 'pinia'
import type { ReadingProgress } from '~/types/reader'
import { READING_PROGRESS_STORAGE_KEY } from '~/types/reader'

export type ProgressMap = Record<string, ReadingProgress>
export type SaveProgressInput = Omit<ReadingProgress, 'readChapterIds'> & { readChapterIds?: string[] }

function migrate(raw: ReadingProgress): ReadingProgress {
  const set = new Set(Array.isArray(raw.readChapterIds) ? raw.readChapterIds : [])
  if (!Array.isArray(raw.readChapterIds) && raw.chapterId && raw.scrollRatio >= 0.9) set.add(raw.chapterId)
  return { ...raw, readChapterIds: Array.from(set) }
}

export const useReadingProgressStore = defineStore('reading-progress', () => {
  const progressMap = ref<ProgressMap>({})
  const initialized = ref(false)
  const progressList = computed(() => Object.values(progressMap.value).sort((a, b) => b.readAt.localeCompare(a.readAt)))

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap.value))
    } catch {
      // 本地存储不可用时保留当前会话状态。
    }
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      const raw = localStorage.getItem(READING_PROGRESS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) as ProgressMap : {}
      progressMap.value = Object.fromEntries(Object.entries(parsed)
        .filter((entry): entry is [string, ReadingProgress] => Boolean(entry[1] && typeof entry[1] === 'object'))
        .map(([key, value]) => [key, migrate(value)]))
    } catch {
      progressMap.value = {}
    }
    initialized.value = true
  }

  function getProgress(novelId: string) {
    return progressMap.value[novelId]
  }

  function getReadChapterIds(novelId: string) {
    return progressMap.value[novelId]?.readChapterIds ?? []
  }

  function isChapterRead(novelId: string, chapterId: string) {
    return getReadChapterIds(novelId).includes(chapterId)
  }

  function saveProgress(progress: SaveProgressInput) {
    if (!import.meta.client) return
    const previous = progressMap.value[progress.novelId]
    const autoMarkRead = useAccountStore().preferences.reading.autoMarkRead
    const readChapterIds = Array.from(new Set([
      ...(previous?.readChapterIds ?? []),
      ...(autoMarkRead && progress.scrollRatio >= 0.9 ? [progress.chapterId] : []),
      ...(progress.readChapterIds ?? [])
    ]))
    progressMap.value = { ...progressMap.value, [progress.novelId]: { ...progress, readChapterIds } }
    persist()
  }

  function clearProgress(novelId: string) {
    progressMap.value = Object.fromEntries(Object.entries(progressMap.value).filter(([key]) => key !== novelId))
    persist()
  }

  function clearAllProgress() {
    progressMap.value = {}
    persist()
  }

  function replaceAllProgress(next: ProgressMap) {
    progressMap.value = Object.fromEntries(Object.entries(next).map(([key, value]) => [key, migrate(value)]))
    initialized.value = true
    persist()
  }

  return { progressMap, initialized, progressList, initialize, getProgress, getReadChapterIds, isChapterRead, saveProgress, clearProgress, clearAllProgress, replaceAllProgress }
})

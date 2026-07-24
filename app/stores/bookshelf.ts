import { defineStore } from 'pinia'
import type { BookshelfItem, BookshelfStatus } from '~/types/bookshelf'
import { BOOKSHELF_STORAGE_KEY } from '~/types/bookshelf'

export const useBookshelfStore = defineStore('bookshelf', () => {
  const items = ref<BookshelfItem[]>([])
  const initialized = ref(false)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(BOOKSHELF_STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // 本地存储不可用时保留当前会话状态。
    }
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      const parsed = JSON.parse(localStorage.getItem(BOOKSHELF_STORAGE_KEY) ?? '[]') as unknown
      items.value = Array.isArray(parsed)
        ? parsed.filter((item): item is BookshelfItem => {
            if (!item || typeof item !== 'object') return false
            const value = item as Partial<BookshelfItem>
            return typeof value.novelId === 'string'
              && ['reading', 'wantRead', 'finished'].includes(value.status ?? '')
              && typeof value.addedAt === 'string'
              && typeof value.updatedAt === 'string'
          })
        : []
    } catch {
      items.value = []
    }
    initialized.value = true
  }

  function getStatus(novelId: string) {
    return items.value.find(item => item.novelId === novelId)?.status
  }

  function add(novelId: string, status: BookshelfStatus = 'reading') {
    const now = new Date().toISOString()
    const existing = items.value.some(item => item.novelId === novelId)
    items.value = existing
      ? items.value.map(item => item.novelId === novelId ? { ...item, status, updatedAt: now } : item)
      : [...items.value, { novelId, status, addedAt: now, updatedAt: now }]
    persist()
  }

  function updateStatus(novelId: string, status: BookshelfStatus) {
    if (getStatus(novelId)) add(novelId, status)
  }

  function remove(novelId: string) {
    items.value = items.value.filter(item => item.novelId !== novelId)
    persist()
  }

  function removeMany(novelIds: string[]) {
    const ids = new Set(novelIds)
    items.value = items.value.filter(item => !ids.has(item.novelId))
    persist()
  }

  function updateMany(novelIds: string[], status: BookshelfStatus) {
    const ids = new Set(novelIds)
    const now = new Date().toISOString()
    items.value = items.value.map(item => ids.has(item.novelId) ? { ...item, status, updatedAt: now } : item)
    persist()
  }

  function replaceAll(nextItems: BookshelfItem[]) {
    items.value = [...nextItems]
    persist()
  }

  return { items, initialized, initialize, getStatus, add, updateStatus, remove, removeMany, updateMany, replaceAll }
})

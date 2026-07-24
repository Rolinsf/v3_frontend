import { defineStore } from 'pinia'
import type { AuthorFollow, NovelUpdatePreference } from '~/types/following'
import { FOLLOWING_STORAGE_KEY } from '~/types/following'

interface FollowingState {
  authors: AuthorFollow[]
  novels: NovelUpdatePreference[]
}

export const useFollowingStore = defineStore('following', () => {
  const authors = ref<AuthorFollow[]>([])
  const novels = ref<NovelUpdatePreference[]>([])
  const initialized = ref(false)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(FOLLOWING_STORAGE_KEY, JSON.stringify({ authors: authors.value, novels: novels.value }))
    } catch {
      // 本地存储不可用时保留当前会话状态。
    }
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      const parsed = JSON.parse(localStorage.getItem(FOLLOWING_STORAGE_KEY) ?? '{}') as Partial<FollowingState>
      authors.value = Array.isArray(parsed.authors)
        ? parsed.authors.filter(item => typeof item?.authorId === 'string' && typeof item?.followedAt === 'string')
        : []
      novels.value = Array.isArray(parsed.novels)
        ? parsed.novels.filter(item => typeof item?.novelId === 'string' && typeof item?.followedAt === 'string')
        : []
    } catch {
      authors.value = []
      novels.value = []
    }
    initialized.value = true
  }

  function isFollowingAuthor(authorId: string) {
    return authors.value.some(item => item.authorId === authorId)
  }

  function toggleAuthor(authorId: string) {
    authors.value = isFollowingAuthor(authorId)
      ? authors.value.filter(item => item.authorId !== authorId)
      : [...authors.value, { authorId, followedAt: new Date().toISOString() }]
    persist()
  }

  function getNovelPreference(novelId: string) {
    return novels.value.find(item => item.novelId === novelId)
  }

  function setNovelNotifications(novelId: string, enabled: boolean, currentUpdateAt?: string) {
    const existing = getNovelPreference(novelId)
    const next: NovelUpdatePreference = existing
      ? { ...existing, notificationsEnabled: enabled }
      : { novelId, notificationsEnabled: enabled, followedAt: new Date().toISOString(), lastSeenUpdateAt: currentUpdateAt }
    novels.value = existing
      ? novels.value.map(item => item.novelId === novelId ? next : item)
      : [...novels.value, next]
    persist()
  }

  function markUpdateSeen(novelId: string, updatedAt: string) {
    if (!getNovelPreference(novelId)) return
    novels.value = novels.value.map(item => item.novelId === novelId ? { ...item, lastSeenUpdateAt: updatedAt } : item)
    persist()
  }

  function unreadCount(novelId: string, updatedAt: string) {
    const preference = getNovelPreference(novelId)
    if (!preference?.notificationsEnabled) return 0
    return updatedAt > (preference.lastSeenUpdateAt ?? preference.followedAt) ? 1 : 0
  }

  return { authors, novels, initialized, initialize, isFollowingAuthor, toggleAuthor, getNovelPreference, setNovelNotifications, markUpdateSeen, unreadCount }
})

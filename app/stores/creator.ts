import { defineStore } from 'pinia'
import type { ChapterDraft, CreatorNovel, CreatorNovelStatus } from '~/types/creator'

const NOVELS_KEY = 'wakabayashi-creator-novels-v1'
const DRAFTS_KEY = 'wakabayashi-chapter-drafts-v1'
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useCreatorStore = defineStore('creator', () => {
  const novels = ref<CreatorNovel[]>([])
  const drafts = ref<ChapterDraft[]>([])
  const initialized = ref(false)

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(NOVELS_KEY, JSON.stringify(novels.value))
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.value))
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      novels.value = JSON.parse(localStorage.getItem(NOVELS_KEY) ?? '[]') as CreatorNovel[]
      drafts.value = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '[]') as ChapterDraft[]
    } catch {
      novels.value = []
      drafts.value = []
    }
    initialized.value = true
  }

  function ownedNovels(ownerId: string) {
    return computed(() => novels.value.filter(novel => novel.ownerId === ownerId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  }

  function getNovel(id: string, ownerId: string) {
    return computed(() => novels.value.find(novel => novel.id === id && novel.ownerId === ownerId))
  }

  function saveNovel(ownerId: string, input: { id?: string, title: string, synopsis: string, coverDataUrl?: string, primaryCategoryId: string, secondaryCategoryId: string, tags: string[], status: CreatorNovelStatus }) {
    const now = new Date().toISOString()
    const existing = input.id ? novels.value.find(novel => novel.id === input.id && novel.ownerId === ownerId) : undefined
    const novel: CreatorNovel = existing
      ? { ...existing, ...input, ownerId, updatedAt: now }
      : { ...input, id: uid('novel'), ownerId, volumes: [{ id: uid('volume'), title: '第一卷', chapters: [] }], createdAt: now, updatedAt: now }
    novels.value = existing ? novels.value.map(item => item.id === novel.id ? novel : item) : [novel, ...novels.value]
    persist()
    return novel
  }

  function addVolume(novelId: string, ownerId: string, title: string) {
    novels.value = novels.value.map(novel => novel.id === novelId && novel.ownerId === ownerId
      ? { ...novel, volumes: [...novel.volumes, { id: uid('volume'), title, chapters: [] }], updatedAt: new Date().toISOString() }
      : novel)
    persist()
  }

  function addChapter(novelId: string, volumeId: string, ownerId: string) {
    const chapterId = uid('chapter')
    novels.value = novels.value.map(novel => novel.id === novelId && novel.ownerId === ownerId
      ? { ...novel, volumes: novel.volumes.map(volume => volume.id === volumeId ? { ...volume, chapters: [...volume.chapters, { id: chapterId, title: '未命名章节', content: { type: 'doc', content: [{ type: 'paragraph' }] }, plainText: '', authorNote: '', status: 'draft', updatedAt: new Date().toISOString() }] } : volume) }
      : novel)
    persist()
    return chapterId
  }

  function saveDraft(draft: ChapterDraft) {
    drafts.value = [...drafts.value.filter(item => item.chapterId !== draft.chapterId), draft]
    persist()
  }

  function publishChapter(novelId: string, volumeId: string, chapterId: string, ownerId: string, draft: ChapterDraft) {
    if (!novels.value.some(item => item.id === novelId && item.ownerId === ownerId)) throw new Error('作品不存在或无权操作。')
    novels.value = novels.value.map(item => item.id === novelId ? { ...item, updatedAt: new Date().toISOString(), volumes: item.volumes.map(volume => volume.id === volumeId ? { ...volume, chapters: volume.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, ...draft, status: 'published', publishedAt: new Date().toISOString(), updatedAt: draft.savedAt } : chapter) } : volume) } : item)
    drafts.value = drafts.value.filter(item => item.chapterId !== chapterId)
    persist()
  }

  return { novels, drafts, initialized, initialize, ownedNovels, getNovel, saveNovel, addVolume, addChapter, saveDraft, publishChapter }
})

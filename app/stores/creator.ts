import { defineStore } from 'pinia'
import type { ChapterDraft, ChapterVersion, CreatorNovel, CreatorNovelStatus } from '~/types/creator'

const NOVELS_KEY = 'wakabayashi-creator-novels-v1'
const DRAFTS_KEY = 'wakabayashi-chapter-drafts-v1'
const VERSIONS_KEY = 'wakabayashi-chapter-versions-v1'
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useCreatorStore = defineStore('creator', () => {
  const novels = ref<CreatorNovel[]>([])
  const drafts = ref<ChapterDraft[]>([])
  const versions = ref<ChapterVersion[]>([])
  const initialized = ref(false)

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(NOVELS_KEY, JSON.stringify(novels.value))
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.value))
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions.value))
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      novels.value = JSON.parse(localStorage.getItem(NOVELS_KEY) ?? '[]') as CreatorNovel[]
      drafts.value = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '[]') as ChapterDraft[]
      versions.value = JSON.parse(localStorage.getItem(VERSIONS_KEY) ?? '[]') as ChapterVersion[]
    } catch {
      novels.value = []
      drafts.value = []
      versions.value = []
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

  function saveDraft(draft: ChapterDraft, reason: ChapterVersion['reason'] = 'autosave') {
    drafts.value = [...drafts.value.filter(item => item.chapterId !== draft.chapterId), draft]
    const latest = versions.value.find(item => item.chapterId === draft.chapterId)
    if (reason !== 'autosave' || !latest || Date.parse(draft.savedAt) - Date.parse(latest.savedAt) >= 30_000) {
      versions.value = [{ ...structuredClone(draft), id: uid('version'), reason }, ...versions.value].slice(0, 100)
    }
    persist()
  }

  function publishChapter(novelId: string, volumeId: string, chapterId: string, ownerId: string, draft: ChapterDraft, scheduledAt?: string) {
    if (!novels.value.some(item => item.id === novelId && item.ownerId === ownerId)) throw new Error('作品不存在或无权操作。')
    saveDraft(draft, 'publish')
    const now = new Date().toISOString()
    novels.value = novels.value.map(item => item.id === novelId ? { ...item, updatedAt: now, volumes: item.volumes.map(volume => volume.id === volumeId ? { ...volume, chapters: volume.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, ...draft, status: scheduledAt ? 'scheduled' : 'published', scheduledAt, publishedAt: scheduledAt ? undefined : now, withdrawnAt: undefined, updatedAt: draft.savedAt } : chapter) } : volume) } : item)
    drafts.value = drafts.value.filter(item => item.chapterId !== chapterId)
    persist()
  }

  function withdrawChapter(novelId: string, chapterId: string, ownerId: string) {
    const novel = novels.value.find(item => item.id === novelId && item.ownerId === ownerId)
    const chapter = novel?.volumes.flatMap(volume => volume.chapters).find(item => item.id === chapterId)
    if (!novel || !chapter || !['published', 'scheduled'].includes(chapter.status)) throw new Error('章节不存在或当前状态不可撤回。')
    const now = new Date().toISOString()
    novels.value = novels.value.map(item => item.id === novelId ? { ...item, updatedAt: now, volumes: item.volumes.map(volume => ({ ...volume, chapters: volume.chapters.map(entry => entry.id === chapterId ? { ...entry, status: 'withdrawn', scheduledAt: undefined, withdrawnAt: now, updatedAt: now } : entry) })) } : item)
    persist()
  }

  function reorderChapter(novelId: string, ownerId: string, chapterId: string, targetVolumeId: string, targetIndex: number) {
    const novel = novels.value.find(item => item.id === novelId && item.ownerId === ownerId)
    if (!novel) return
    const chapter = novel.volumes.flatMap(volume => volume.chapters).find(item => item.id === chapterId)
    if (!chapter) return
    novel.volumes = novel.volumes.map(volume => ({ ...volume, chapters: volume.chapters.filter(item => item.id !== chapterId) }))
    const target = novel.volumes.find(volume => volume.id === targetVolumeId)
    if (!target) return
    target.chapters.splice(Math.max(0, Math.min(targetIndex, target.chapters.length)), 0, chapter)
    novel.updatedAt = new Date().toISOString()
    novels.value = [...novels.value]
    persist()
  }

  function getVersions(chapterId: string) {
    return computed(() => versions.value.filter(item => item.chapterId === chapterId).sort((a, b) => b.savedAt.localeCompare(a.savedAt)))
  }

  return { novels, drafts, versions, initialized, initialize, ownedNovels, getNovel, saveNovel, addVolume, addChapter, saveDraft, publishChapter, withdrawChapter, reorderChapter, getVersions }
})

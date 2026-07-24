import type { JSONContent } from '@tiptap/vue-3'

export type CreatorNovelStatus = 'draft' | 'serializing' | 'completed'
export type CreatorChapterStatus = 'draft' | 'scheduled' | 'published' | 'withdrawn'

export interface CreatorChapter {
  id: string
  title: string
  content: JSONContent
  plainText: string
  authorNote: string
  status: CreatorChapterStatus
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
  withdrawnAt?: string
}

export interface CreatorVolume {
  id: string
  title: string
  chapters: CreatorChapter[]
}

export interface CreatorNovel {
  id: string
  ownerId: string
  title: string
  synopsis: string
  coverDataUrl?: string
  primaryCategoryId: string
  secondaryCategoryId: string
  tags: string[]
  status: CreatorNovelStatus
  volumes: CreatorVolume[]
  createdAt: string
  updatedAt: string
}

export interface ChapterDraft {
  novelId: string
  volumeId: string
  chapterId: string
  title: string
  content: JSONContent
  plainText: string
  authorNote: string
  savedAt: string
}

export interface ChapterVersion extends ChapterDraft {
  id: string
  reason: 'autosave' | 'manual' | 'publish' | 'withdraw'
}

import type { JSONContent } from '@tiptap/vue-3'

export type CreatorNovelStatus = 'draft' | 'serializing' | 'completed'
export type CreatorChapterStatus = 'draft' | 'published'

export interface CreatorChapter {
  id: string
  title: string
  content: JSONContent
  plainText: string
  authorNote: string
  status: CreatorChapterStatus
  updatedAt: string
  publishedAt?: string
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

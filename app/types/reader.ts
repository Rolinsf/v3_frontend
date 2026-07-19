// 阅读器相关类型：阅读设置与阅读进度。
// 阅读设置保存在 localStorage（访客）或同步到服务端（登录后）。
// 阅读进度同理：访客在本地，登录后可同步。

export type ReaderTheme = 'paper' | 'warm' | 'green' | 'night'
export type ReaderFont = 'sans' | 'serif'

/** 阅读设置：可序列化到 localStorage 或服务端。 */
export interface ReaderSettings {
  fontSize: number
  lineHeight: number
  pageWidth: number
  theme: ReaderTheme
  font: ReaderFont
}

/** 阅读进度：记录用户在某章节的阅读位置，用于"继续阅读"。 */
export interface ReadingProgress {
  novelId: string
  chapterId: string
  /** 章节标题用于历史记录展示；旧版本地数据可能没有。 */
  chapterTitle?: string
  /** 章节内滚动比例，0-1；用于恢复阅读位置。 */
  scrollRatio: number
  /** 上次阅读时间戳（ISO 8601）。 */
  readAt: string
  /**
   * 该小说下已读章节 ID 集合（去重）。
   * 用于详情页目录"已读"标记与阶段 4 的阅读历史。
   * 旧版本数据可能缺失该字段，加载时会自动迁移为 `[]` 并补上当前 chapterId。
   */
  readChapterIds: string[]
}

/** 默认阅读设置：未保存过偏好时使用。 */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.9,
  pageWidth: 760,
  theme: 'paper',
  font: 'serif'
}

/** localStorage 中保存阅读设置的 key。 */
export const READER_SETTINGS_STORAGE_KEY = 'wakabayashi-reader-settings'
/** localStorage 中保存访客阅读进度的 key（按 novelId 聚合的字典）。 */
export const READING_PROGRESS_STORAGE_KEY = 'wakabayashi-reading-progress'

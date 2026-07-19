// 书架类型：访客本地书架 + 登录后云端书架的统一形态。
// 阶段 4 仅使用 localStorage；阶段 8 接入真实 API 后，
// useBookshelf 内部改为调用 /bookshelf 接口，调用方无需改动。

export type BookshelfStatus = 'reading' | 'wantRead' | 'finished'

export interface BookshelfItem {
  novelId: string
  status: BookshelfStatus
  /** 加入书架的时间（ISO 8601）。 */
  addedAt: string
  /** 最近一次状态变更时间，用于默认排序。 */
  updatedAt: string
}

/** 书架状态对应的中文标签：UI 与 URL 查询参数都用这套短词。 */
export const BOOKSHELF_STATUS_LABELS: Record<BookshelfStatus, string> = {
  reading: '正在阅读',
  wantRead: '想读',
  finished: '已读完'
}

/** localStorage 中保存书架的 key。 */
export const BOOKSHELF_STORAGE_KEY = 'wakabayashi-bookshelf'

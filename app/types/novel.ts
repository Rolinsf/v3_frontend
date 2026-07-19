// 小说领域类型：覆盖作品摘要、详情、卷、章节、分类与标签。
// 该文件是页面与 API 层共同依赖的稳定契约，字段命名与后端 API 保持一致。

/** 一级与二级分类路径，例如 `{ primary: '奇幻', secondary: '异世界' }`。 */
export interface NovelCategory {
  primary: string
  secondary: string
}

/** 标签：用于补充题材、要素和氛围，可多选。 */
export interface Tag {
  id: string
  name: string
}

/**
 * @deprecated 历史名称，保留作为别名以兼容已有引用；新代码请使用 `Tag`。
 */
export type NovelTag = Tag

/** 作者摘要：嵌在作品摘要中，避免循环引用完整用户对象。 */
export interface AuthorSummary {
  id: string
  name: string
}

/** 最近一章摘要：用于首页"最近更新"和详情页"最新章节"提示。 */
export interface LatestChapterSummary {
  id: string
  title: string
}

export type NovelStatus = 'serializing' | 'completed'

/** 作品摘要：用于列表、卡片、首页推荐等不需要完整卷章信息的场景。 */
export interface NovelSummary {
  id: string
  title: string
  author: AuthorSummary
  synopsis: string
  coverTone: string
  category: NovelCategory
  tags: Tag[]
  status: NovelStatus
  wordCount: number
  updatedAt: string
  latestChapter: LatestChapterSummary
}

/** 章节摘要：出现在卷目录中，不包含正文。 */
export interface ChapterSummary {
  id: string
  title: string
  order: number
  wordCount: number
  publishedAt: string
  isLatest?: boolean
  /** 章节是否被锁定（如付费/审核中），访客不可读正文。 */
  isLocked?: boolean
}

/** 卷：包含卷信息与其下章节列表。 */
export interface NovelVolume {
  id: string
  title: string
  description?: string
  chapters: ChapterSummary[]
}

/** 作品详情：在摘要基础上扩展公告、卷章和收藏数。 */
export interface NovelDetail extends NovelSummary {
  announcement?: string
  volumes: NovelVolume[]
  bookshelfCount: number
}

/** 章节正文：阅读器渲染所需的全部字段。 */
export interface ChapterContent extends ChapterSummary {
  novelId: string
  novelTitle: string
  volumeTitle: string
  paragraphs: string[]
  authorNote?: string
  previousChapterId?: string
  nextChapterId?: string
}

/** 分类树节点：用于书库筛选与管理后台。 */
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  /** 该分类下作品数（管理后台展示用）。 */
  novelCount?: number
  enabled: boolean
  children: CategorySecondary[]
}

/** 二级分类：固定两层，避免分类树失控。 */
export interface CategorySecondary {
  id: string
  name: string
  slug: string
  description?: string
  novelCount?: number
  enabled: boolean
}

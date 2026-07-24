import type { ChapterContent, NovelDetail, NovelSummary, Category } from '~/types/novel'
import {
  categoryTree,
  chapterContents,
  featuredNovelDetail,
  novelDetails,
  novelSummaries
} from '~/fixtures/novels'
import { publicUsers } from '~/fixtures/users'
import type { PublicUserProfile } from '~/types/user'

// 数据 composable：页面与组件唯一的数据入口。
// 阶段 2-7 使用 fixtures 作为数据源；阶段 8 接入真实 API 时，
// 只需把每个函数内部改为 `await useApi().get<T>('/novels/...')`，调用方无需改动。

/** 全部小说摘要：用于首页"编辑推荐"、"最近更新"和书库列表。 */
export function useNovelList() {
  return useAsyncData<NovelSummary[]>('novel-list', async () => novelSummaries)
}

/** 书库/搜索可用的排序方式。 */
export type NovelSort = 'updated' | 'wordCount' | 'debut' | 'latestChapter'

/** 书库/搜索查询参数：所有字段可选，与 URL 查询参数一一对应。 */
export interface NovelSearchQuery {
  /** 关键词：匹配标题、作者名、标签名。 */
  q?: string
  /** 一级分类 slug（如 `daily`）。 */
  category?: string
  /** 二级分类 slug（如 `campus`）。需要与一级分类匹配。 */
  subcategory?: string
  /** 标签 id（如 `healing`）。 */
  tag?: string
  /** 完结状态。 */
  status?: 'serializing' | 'completed'
  /** 排序方式。 */
  sort?: NovelSort
}

/** 把 slug 翻译为中文名称的工具：筛选时 fixtures 用中文名匹配。 */
function buildSlugMaps() {
  const primary = new Map<string, string>()
  const secondary = new Map<string, string>()
  for (const cat of categoryTree) {
    primary.set(cat.slug, cat.name)
    for (const child of cat.children) {
      // 二级 slug 在所属一级范围内唯一，因此用全 slug 作为 key 即可。
      secondary.set(child.slug, child.name)
    }
  }
  return { primary, secondary }
}

const slugMaps = buildSlugMaps()

/**
 * 书库/搜索：根据查询参数筛选并排序 fixtures 数据。
 * 阶段 8 切换为真实 API 时，把 query 直接传给 `/novels` 接口即可。
 */
export function useNovelSearch(query: MaybeRefOrGetter<NovelSearchQuery>) {
  const source = computed(() => toValue(query))
  return useAsyncData<NovelSummary[]>(
    () => `novel-search-${JSON.stringify(source.value)}`,
    async () => {
      const q = source.value
      let list = [...novelSummaries]
      // 关键词：在标题、作者名、标签名里做大小写不敏感的包含匹配。
      const keywords = q.q?.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) ?? []
      if (keywords.length) {
        list = list.filter((novel) => {
          const indexText = [
            novel.title,
            novel.author.name,
            novel.synopsis,
            novel.category.primary,
            novel.category.secondary,
            novel.latestChapter.title,
            ...novel.tags.map(tag => tag.name)
          ].join(' ').toLocaleLowerCase()
          return keywords.every(keyword => indexText.includes(keyword))
        })
      }
      // 一级分类：按 slug 翻译为中文名再匹配。
      if (q.category) {
        const primaryName = slugMaps.primary.get(q.category)
        if (primaryName) list = list.filter(n => n.category.primary === primaryName)
      }
      // 二级分类：需要同时满足一级，避免跨一级误匹配。
      if (q.subcategory) {
        const secondaryName = slugMaps.secondary.get(q.subcategory)
        if (secondaryName) list = list.filter(n => n.category.secondary === secondaryName)
      }
      // 标签：按 id 匹配。
      if (q.tag) {
        list = list.filter(n => n.tags.some(t => t.id === q.tag))
      }
      // 状态：连载中/已完结。
      if (q.status) {
        list = list.filter(n => n.status === q.status)
      }
      // 排序：默认按最近更新。
      const sort = q.sort ?? 'updated'
      switch (sort) {
        case 'wordCount':
          list.sort((a, b) => b.wordCount - a.wordCount)
          break
        case 'debut':
          // 新作：字数少的优先，体现"还在悄悄成长"的语义。
          list.sort((a, b) => a.wordCount - b.wordCount)
          break
        case 'latestChapter':
          list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          break
        case 'updated':
        default:
          list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          break
      }
      return list
    },
    { watch: [source] }
  )
}

/** 编辑推荐小说：首页 hero 区使用。 */
export function useFeaturedNovel() {
  return useAsyncData<NovelSummary>('featured-novel', async () => featuredNovelDetail)
}

/** 小说详情：包含卷章、公告和收藏数。未命中时抛 404。 */
export function useNovelDetail(id: MaybeRefOrGetter<string>) {
  const novelId = computed(() => toValue(id))
  return useAsyncData<NovelDetail>(
    () => `novel-detail-${novelId.value}`,
    async () => {
      const detail = novelDetails.find(item => item.id === novelId.value)
      if (!detail) {
        throw createError({ statusCode: 404, statusMessage: '没有找到这部小说' })
      }
      return detail
    },
    { watch: [novelId] }
  )
}

/** 章节正文：未命中小说或章节时抛 404。 */
export function useChapter(novelId: MaybeRefOrGetter<string>, chapterId: MaybeRefOrGetter<string>) {
  const nid = computed(() => toValue(novelId))
  const cid = computed(() => toValue(chapterId))
  return useAsyncData<ChapterContent>(
    () => `chapter-${nid.value}-${cid.value}`,
    async () => {
      const chapter = chapterContents[cid.value]
      if (!chapter || chapter.novelId !== nid.value) {
        throw createError({ statusCode: 404, statusMessage: '没有找到这一章' })
      }
      return chapter
    },
    { watch: [nid, cid] }
  )
}

/** 分类树：首页"按分类散步"和书库筛选侧栏共用。 */
export function useCategoryTree() {
  return useAsyncData<Category[]>('category-tree', async () => categoryTree)
}

/** 用户公开主页资料；仅返回明确允许公开的字段。 */
export function usePublicUser(id: MaybeRefOrGetter<string>) {
  const userId = computed(() => toValue(id))
  return useAsyncData<PublicUserProfile>(
    () => `public-user-${userId.value}`,
    async () => {
      const user = publicUsers.find(item => item.id === userId.value)
      if (!user) throw createError({ statusCode: 404, statusMessage: '没有找到这位用户' })
      return user
    },
    { watch: [userId] }
  )
}

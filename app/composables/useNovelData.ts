import type { ChapterContent, NovelDetail } from '~/types/novel'
import {
  chapterContents,
  featuredNovelDetail,
  novelSummaries
} from '~/fixtures/novels'

// 历史接口：保留以兼容尚未迁移的调用方。新代码请使用 useNovels 中的 useAsyncData 包装版本。
// @deprecated use `useNovelList` / `useNovelDetail` / `useChapter` instead.
export function useNovelData() {
  const getNovel = (id: string): NovelDetail | undefined => id === featuredNovelDetail.id ? featuredNovelDetail : undefined
  const getChapter = (novelId: string, chapterId: string): ChapterContent | undefined => novelId === featuredNovelDetail.id ? chapterContents[chapterId] : undefined
  return {
    novels: readonly(novelSummaries),
    featuredNovel: readonly(featuredNovelDetail),
    getNovel,
    getChapter
  }
}

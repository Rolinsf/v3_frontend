import type { NovelSummary } from '~/types/novel'

export type RankingKind = 'hot' | 'bookshelf' | 'debut' | 'completed'

function stableSeed(value: string) {
  return [...value].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) % 997, 17)
}

export function useRankingMetrics(novels: Ref<NovelSummary[] | undefined>, kind: Ref<RankingKind>) {
  const bookshelf = useBookshelfStore()
  const progress = useReadingProgressStore()
  const ranked = computed(() => {
    const shelfIds = new Set(bookshelf.items.map(item => item.novelId))
    const readIds = new Set(progress.progressList.map(item => item.novelId))
    return (novels.value ?? []).map((novel) => {
      const seed = stableSeed(novel.id)
      const reads = 80 + seed + (readIds.has(novel.id) ? 1 : 0)
      const saves = 12 + seed % 83 + (shelfIds.has(novel.id) ? 1 : 0)
      const freshness = Math.max(0, 30 - Math.floor((Date.now() - new Date(novel.updatedAt).getTime()) / 86_400_000))
      const score = kind.value === 'bookshelf' ? saves : kind.value === 'debut' ? (novel.status === 'serializing' && novel.wordCount < 100_000 ? freshness * 30 + reads : -1) : kind.value === 'completed' ? (novel.status === 'completed' ? reads + saves * 2 : -1) : reads + saves * 3 + freshness * 10
      return { novel, score, reads, saves }
    }).filter(item => item.score >= 0).sort((a, b) => b.score - a.score)
  })
  const updatedAt = computed(() => new Date().toISOString().slice(0, 10))
  return { ranked, updatedAt, period: '最近 30 天', policy: '同一浏览器对同一作品的重复行为仅计一次；每天重新计算。' }
}

// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { mergeReadingProgress } from '~/utils/reading-progress'

describe('mergeReadingProgress', () => {
  it('keeps the newest position and unions read chapters', () => {
    const merged = mergeReadingProgress(
      {
        novel: { novelId: 'novel', chapterId: 'ch-2', chapterTitle: '第二章', scrollRatio: 0.4, readAt: '2026-07-19T10:00:00Z', readChapterIds: ['ch-1', 'ch-2'] }
      },
      {
        novel: { novelId: 'novel', chapterId: 'ch-1', chapterTitle: '第一章', scrollRatio: 0.9, readAt: '2026-07-18T10:00:00Z', readChapterIds: ['ch-1'] }
      }
    )

    expect(merged.novel?.chapterId).toBe('ch-2')
    expect(merged.novel?.readChapterIds).toEqual(['ch-1', 'ch-2'])
  })

  it('preserves novels that only exist on one side', () => {
    const merged = mergeReadingProgress(
      { local: { novelId: 'local', chapterId: 'a', scrollRatio: 0, readAt: '2026-07-19T10:00:00Z', readChapterIds: ['a'] } },
      { remote: { novelId: 'remote', chapterId: 'b', scrollRatio: 0, readAt: '2026-07-19T11:00:00Z', readChapterIds: ['b'] } }
    )
    expect(Object.keys(merged).sort()).toEqual(['local', 'remote'])
  })
})

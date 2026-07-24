// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { mergeBookshelfItems } from '~/utils/bookshelf'

describe('mergeBookshelfItems', () => {
  it('keeps the newest state for a novel across devices', () => {
    const result = mergeBookshelfItems(
      [{ novelId: 'novel-1', status: 'finished', addedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z' }],
      [{ novelId: 'novel-1', status: 'reading', addedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }]
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('finished')
  })

  it('retains books that exist on only one device', () => {
    const result = mergeBookshelfItems(
      [{ novelId: 'local', status: 'reading', addedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }],
      [{ novelId: 'remote', status: 'wantRead', addedAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }]
    )

    expect(result.map(item => item.novelId)).toEqual(['remote', 'local'])
  })
})

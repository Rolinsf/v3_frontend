// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { chapterContents, novelDetails, novelSummaries } from '~/fixtures/novels'

describe('novel fixtures', () => {
  it('keeps every summary linked to a detail and readable listed chapters', () => {
    for (const summary of novelSummaries) {
      const detail = novelDetails.find(item => item.id === summary.id)
      expect(detail, `missing detail for ${summary.id}`).toBeDefined()
      expect(detail!.latestChapter.id).toBe(summary.latestChapter.id)

      for (const chapter of detail!.volumes.flatMap(volume => volume.chapters)) {
        expect(chapterContents[chapter.id]?.novelId, `missing content for ${summary.id}/${chapter.id}`).toBe(summary.id)
      }
    }
  })

  it('does not reuse a chapter under the wrong novel', () => {
    for (const content of Object.values(chapterContents)) {
      const detail = novelDetails.find(item => item.id === content.novelId)
      expect(detail?.volumes.some(volume => volume.chapters.some(chapter => chapter.id === content.id))).toBe(true)
    }
  })
})

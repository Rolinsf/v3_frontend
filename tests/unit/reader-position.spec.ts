// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getReadingRatio, getScrollYForReadingRatio } from '../../app/utils/reader-position'

describe('reader position', () => {
  const content = { viewportHeight: 800, contentTop: 400, contentHeight: 4000 }

  it('converts the reading line into a clamped chapter ratio', () => {
    expect(getReadingRatio({ ...content, scrollY: 120 })).toBe(0)
    expect(getReadingRatio({ ...content, scrollY: 3720 })).toBe(1)
  })

  it('restores a saved ratio to the corresponding scroll position', () => {
    const scrollY = getScrollYForReadingRatio(content, 0.42)
    expect(getReadingRatio({ ...content, scrollY })).toBeCloseTo(0.42)
  })

  it('remains stable for a very long chapter', () => {
    const ratio = getReadingRatio({ ...content, contentHeight: 5_000_000, scrollY: 2_500_000 })
    expect(ratio).toBeGreaterThan(0.49)
    expect(ratio).toBeLessThan(0.51)
  })
})

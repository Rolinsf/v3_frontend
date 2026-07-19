// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { initialAdminData } from '~/fixtures/admin'

describe('admin fixtures', () => {
  it('keeps categories at exactly two levels', () => {
    for (const primary of initialAdminData.categories) {
      expect(Array.isArray(primary.children)).toBe(true)
      for (const secondary of primary.children) {
        expect('children' in secondary).toBe(false)
      }
    }
  })

  it('uses unique slugs among siblings', () => {
    const primarySlugs = initialAdminData.categories.map(item => item.slug)
    expect(new Set(primarySlugs).size).toBe(primarySlugs.length)
    for (const primary of initialAdminData.categories) {
      const childSlugs = primary.children.map(item => item.slug)
      expect(new Set(childSlugs).size).toBe(childSlugs.length)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { buildContributionGrid, contributionLevel, contributionYears } from '../../app/utils/contributions'

describe('contribution calendar', () => {
  it('builds full weeks and maps counts', () => {
    const cells = buildContributionGrid(2026, [{ date: '2026-07-17', count: 3 }])
    expect(cells.length % 7).toBe(0)
    expect(cells.find(cell => cell.date === '2026-07-17')).toMatchObject({ count: 3, inYear: true })
    expect(cells[0]?.date).toBe('2025-12-28')
    expect(cells.at(-1)?.date).toBe('2027-01-02')
  })

  it('groups intensity and available years', () => {
    expect([0, 1, 2, 4, 6].map(contributionLevel)).toEqual([0, 1, 2, 3, 4])
    expect(contributionYears([
      { date: '2024-01-01', count: 1 },
      { date: '2026-01-01', count: 1 }
    ], 2025)).toEqual([2026, 2025, 2024])
  })
})

import type { ContributionDay } from '~/types/user'

export interface ContributionCell {
  date: string
  count: number
  inYear: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** 生成按周分列、周日到周六排列的完整年度网格。 */
export function buildContributionGrid(year: number, contributions: ContributionDay[]): ContributionCell[] {
  const counts = new Map(contributions.map(item => [item.date, Math.max(0, item.count)]))
  const firstDay = new Date(Date.UTC(year, 0, 1))
  const lastDay = new Date(Date.UTC(year, 11, 31))
  const gridStart = new Date(firstDay.getTime() - firstDay.getUTCDay() * DAY_MS)
  const trailingDays = 6 - lastDay.getUTCDay()
  const gridEnd = new Date(lastDay.getTime() + trailingDays * DAY_MS)
  const cells: ContributionCell[] = []

  for (let time = gridStart.getTime(); time <= gridEnd.getTime(); time += DAY_MS) {
    const date = new Date(time)
    const key = toDateKey(date)
    cells.push({ date: key, count: counts.get(key) ?? 0, inYear: date.getUTCFullYear() === year })
  }
  return cells
}

export function contributionLevel(count: number) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

export function contributionYears(contributions: ContributionDay[], fallbackYear: number) {
  const years = new Set(contributions.map(item => Number(item.date.slice(0, 4))))
  years.add(fallbackYear)
  return [...years].filter(Number.isInteger).sort((a, b) => b - a)
}

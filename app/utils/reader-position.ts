export interface ReaderPositionMetrics {
  scrollY: number
  viewportHeight: number
  contentTop: number
  contentHeight: number
}

export function clampReadingRatio(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function getReadingRatio(metrics: ReaderPositionMetrics) {
  const readingLine = metrics.scrollY + metrics.viewportHeight * 0.35
  const distance = Math.max(1, metrics.contentHeight - metrics.viewportHeight * 0.65)
  return clampReadingRatio((readingLine - metrics.contentTop) / distance)
}

export function getScrollYForReadingRatio(metrics: Omit<ReaderPositionMetrics, 'scrollY'>, ratio: number) {
  const distance = Math.max(1, metrics.contentHeight - metrics.viewportHeight * 0.65)
  return Math.max(0, metrics.contentTop + clampReadingRatio(ratio) * distance - metrics.viewportHeight * 0.35)
}

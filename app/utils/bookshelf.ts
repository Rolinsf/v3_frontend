import type { BookshelfItem } from '~/types/bookshelf'

export function mergeBookshelfItems(local: BookshelfItem[], remote: BookshelfItem[]) {
  const merged = new Map<string, BookshelfItem>()

  for (const item of [...remote, ...local]) {
    const existing = merged.get(item.novelId)
    if (!existing || Date.parse(item.updatedAt) >= Date.parse(existing.updatedAt)) {
      merged.set(item.novelId, item)
    }
  }

  return [...merged.values()].sort((left, right) =>
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  )
}

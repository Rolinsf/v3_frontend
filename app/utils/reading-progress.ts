import type { ProgressMap } from '~/stores/reading-progress'
import type { ReadingProgress } from '~/types/reader'

function mergeEntry(local: ReadingProgress | undefined, remote: ReadingProgress | undefined) {
  if (!local) return remote
  if (!remote) return local
  const latest = local.readAt >= remote.readAt ? local : remote
  return {
    ...latest,
    readChapterIds: Array.from(new Set([
      ...(local.readChapterIds ?? []),
      ...(remote.readChapterIds ?? []),
      local.chapterId,
      remote.chapterId
    ]))
  }
}

/** 合并访客本地与用户远端进度：位置取最新，已读章节取并集。 */
export function mergeReadingProgress(local: ProgressMap, remote: ProgressMap): ProgressMap {
  const ids = new Set([...Object.keys(local), ...Object.keys(remote)])
  const merged: ProgressMap = {}
  for (const id of ids) {
    const entry = mergeEntry(local[id], remote[id])
    if (entry) merged[id] = entry
  }
  return merged
}

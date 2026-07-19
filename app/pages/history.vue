<script setup lang="ts">
import type { ReadingProgress } from '~/types/reader'

useSeoMeta({ title: '阅读历史｜若林轻小说', description: '查看并继续最近读过的小说章节。' })

const auth = useAuthStore()
const progressSync = useReadingProgressSync()
const { data: novels, pending, error, refresh } = useNovelList()
const { progressList, clearProgress, clearAllProgress } = useReadingProgress()

const entries = computed(() => progressList.value.map(progress => ({
  progress,
  novel: novels.value?.find(novel => novel.id === progress.novelId)
})).filter(entry => entry.novel))

const groupedEntries = computed(() => {
  const groups = new Map<string, typeof entries.value>()
  for (const entry of entries.value) {
    const key = dateKey(entry.progress.readAt)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return Array.from(groups, ([key, items]) => ({ key, label: dateLabel(key), items }))
})

function dateKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateLabel(key: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (key === dateKey(today.toISOString())) return '今天'
  if (key === dateKey(yesterday.toISOString())) return '昨天'
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${key}T00:00:00`))
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function progressPercent(progress: ReadingProgress) {
  return Math.round(Math.min(1, Math.max(0, progress.scrollRatio)) * 100)
}

function confirmClearAll() {
  if (!import.meta.client || progressList.value.length === 0) return
  if (window.confirm('确定清空全部阅读历史吗？此操作无法撤销。')) clearAllProgress()
}
</script>

<template>
  <main class="history-page">
    <div class="site-container history-shell">
      <header class="history-heading">
        <div>
          <p class="history-heading__eyebrow">
            READING TRAIL
          </p>
          <h1>阅读历史</h1>
          <p>故事不会催你赶路，它会记住你停下的地方。</p>
        </div>
        <UButton
          v-if="progressList.length"
          label="清空全部"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          @click="confirmClearAll"
        />
      </header>

      <ClientOnly>
        <aside class="history-sync-note">
          <UIcon :name="auth.isLoggedIn ? 'i-lucide-cloud' : 'i-lucide-hard-drive'" />
          <p>
            <strong>{{ auth.isLoggedIn ? '阅读进度同步已开启' : '历史仅保存在当前浏览器' }}</strong>
            <span v-if="auth.isLoggedIn && progressSync.state.value === 'error'">{{ progressSync.errorMessage.value }}</span>
            <span v-else-if="auth.isLoggedIn">当前为 mock 用户同步；阶段 8 接入真实 API 后可跨设备使用。</span>
            <span v-else><NuxtLink to="/login?redirect=/history">登录</NuxtLink>后可在后续版本跨设备同步。</span>
          </p>
        </aside>
      </ClientOnly>

      <LoadingSkeleton v-if="pending" />
      <ErrorState
        v-else-if="error"
        description="阅读历史暂时无法加载，请稍后再试。"
        @retry="refresh()"
      />
      <EmptyState
        v-else-if="entries.length === 0"
        icon="i-lucide-history"
        title="还没有阅读足迹"
        description="打开任意公开章节后，阅读位置会安全地保存在当前浏览器。"
        action-label="去书库找故事"
        action-to="/novels"
      />
      <div
        v-else
        class="history-groups"
      >
        <section
          v-for="group in groupedEntries"
          :key="group.key"
          class="history-group"
        >
          <h2>{{ group.label }}</h2>
          <div class="history-list">
            <article
              v-for="entry in group.items"
              :key="entry.progress.novelId"
              class="history-item"
            >
              <div class="history-item__marker">
                <i />
              </div>
              <div class="history-item__body">
                <div class="history-item__topline">
                  <time :datetime="entry.progress.readAt">{{ timeLabel(entry.progress.readAt) }}</time>
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    aria-label="删除这条阅读历史"
                    @click="clearProgress(entry.progress.novelId)"
                  />
                </div>
                <NuxtLink
                  :to="`/novels/${entry.novel!.id}`"
                  class="history-item__novel"
                >{{ entry.novel!.title }}</NuxtLink>
                <p>{{ entry.progress.chapterTitle ?? `章节 ${entry.progress.chapterId}` }}</p>
                <div class="history-item__progress">
                  <span><i :style="{ width: `${progressPercent(entry.progress)}%` }" /></span>
                  <small>本章 {{ progressPercent(entry.progress) }}%</small>
                </div>
                <UButton
                  :to="`/novels/${entry.progress.novelId}/chapters/${entry.progress.chapterId}`"
                  label="继续阅读"
                  icon="i-lucide-arrow-right"
                  trailing
                  color="neutral"
                  variant="outline"
                  size="sm"
                />
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.history-page { padding: 3rem 0 5rem; }
.history-shell { max-width: 820px; }
.history-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }
.history-heading__eyebrow { color: var(--site-warm); font-size: .68rem; letter-spacing: .16em; }
.history-heading h1 { margin-top: .35rem; font-family: var(--font-reading); font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 600; }
.history-heading > div > p:last-child { margin-top: .5rem; color: var(--site-muted); font-size: .85rem; }
.history-sync-note { display: flex; gap: .75rem; margin: 2rem 0; padding: .85rem 1rem; border: 1px solid color-mix(in srgb, var(--site-warm) 35%, var(--site-line)); border-radius: .75rem; background: color-mix(in srgb, var(--site-warm) 7%, var(--site-surface)); }
.history-sync-note > svg { flex: none; margin-top: .1rem; color: var(--site-warm); }.history-sync-note p { display: grid; gap: .15rem; font-size: .8rem; }.history-sync-note span { color: var(--site-muted); }.history-sync-note a { color: var(--color-brand-700); }
.history-groups { display: grid; gap: 2.25rem; }.history-group > h2 { margin-bottom: .8rem; color: var(--site-muted); font-size: .75rem; font-weight: 500; letter-spacing: .08em; }
.history-list { border-top: 1px solid var(--site-line); }.history-item { display: grid; grid-template-columns: 1.25rem minmax(0, 1fr); gap: .75rem; padding: 1.25rem 0; border-bottom: 1px solid var(--site-line); }.history-item__marker { position: relative; display: flex; justify-content: center; }.history-item__marker::after { content: ""; position: absolute; top: 1rem; bottom: -1.3rem; width: 1px; background: var(--site-line); }.history-item:last-child .history-item__marker::after { display: none; }.history-item__marker i { z-index: 1; width: .5rem; height: .5rem; margin-top: .35rem; border: 2px solid var(--site-surface); border-radius: 50%; background: var(--site-warm); box-shadow: 0 0 0 1px var(--site-warm); }
.history-item__body { min-width: 0; }.history-item__topline { display: flex; align-items: center; justify-content: space-between; height: 1.5rem; }.history-item__topline time { color: var(--site-muted); font-size: .7rem; }.history-item__novel { display: inline-block; margin-top: .15rem; font-size: 1rem; font-weight: 600; }.history-item__body > p { margin: .25rem 0 .7rem; color: var(--site-muted); font-size: .8rem; }
.history-item__progress { display: flex; align-items: center; gap: .65rem; margin-bottom: .85rem; }.history-item__progress > span { width: min(12rem, 55%); height: .25rem; overflow: hidden; border-radius: 999px; background: var(--site-line); }.history-item__progress i { display: block; height: 100%; border-radius: inherit; background: var(--site-warm); }.history-item__progress small { color: var(--site-muted); font-size: .68rem; }
@media (max-width: 600px) { .history-page { padding-top: 1.5rem; }.history-heading { align-items: flex-start; flex-direction: column; gap: 1rem; }.history-item { grid-template-columns: .75rem minmax(0, 1fr); gap: .6rem; } }
</style>

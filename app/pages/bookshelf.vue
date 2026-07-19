<script setup lang="ts">
import type { BookshelfStatus } from '~/types/bookshelf'
import { BOOKSHELF_STATUS_LABELS } from '~/types/bookshelf'

useSeoMeta({
  title: '我的书架｜若林轻小说',
  description: '管理想读、正在阅读和已经读完的作品。'
})

const auth = useAuthStore()
const { data: novels, pending, error, refresh } = useNovelList()
const { items, initialized, updateStatus, remove } = useBookshelf()
const { getProgress } = useReadingProgress()
const activeStatus = ref<BookshelfStatus>('reading')

const tabs = (Object.keys(BOOKSHELF_STATUS_LABELS) as BookshelfStatus[]).map(value => ({
  value,
  label: BOOKSHELF_STATUS_LABELS[value]
}))

const visibleItems = computed(() => items.value
  .filter(item => item.status === activeStatus.value)
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .map(item => ({
    shelf: item,
    novel: novels.value?.find(novel => novel.id === item.novelId),
    progress: getProgress(item.novelId)
  }))
  .filter(entry => entry.novel))

function progressLabel(novelId: string) {
  const progress = getProgress(novelId)
  return progress ? `上次阅读：${formatDate(progress.readAt)}` : '还没有阅读记录'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(value))
}
</script>

<template>
  <main class="bookshelf-page">
    <div class="site-container bookshelf-shell">
      <header class="bookshelf-heading">
        <div>
          <p class="bookshelf-heading__eyebrow">
            PRIVATE LIBRARY
          </p>
          <h1>我的书架</h1>
          <p>把想读的故事收好，也记住每一次停下来的地方。</p>
        </div>
        <div class="bookshelf-heading__actions">
          <UButton
            to="/history"
            label="阅读历史"
            icon="i-lucide-history"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="/novels"
            label="去书库看看"
            icon="i-lucide-library"
            color="neutral"
            variant="outline"
          />
        </div>
      </header>

      <ClientOnly>
        <aside
          v-if="auth.isLoggedIn"
          class="bookshelf-notice"
        >
          <UIcon name="i-lucide-cloud" />
          <p><strong>本阶段暂存于当前设备</strong><span>云端书架同步将在 API 接入阶段开放。</span></p>
        </aside>
        <aside
          v-else
          class="bookshelf-notice bookshelf-notice--guest"
        >
          <UIcon name="i-lucide-user-round" />
          <p><strong>这是你的本地书架</strong><span><NuxtLink to="/login?redirect=/bookshelf">登录</NuxtLink>后可在后续版本跨设备同步。</span></p>
        </aside>
      </ClientOnly>

      <nav
        class="bookshelf-tabs"
        aria-label="书架分类"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="{ 'is-active': activeStatus === tab.value }"
          @click="activeStatus = tab.value"
        >
          {{ tab.label }}
          <span>{{ items.filter(item => item.status === tab.value).length }}</span>
        </button>
      </nav>

      <LoadingSkeleton v-if="pending || !initialized" />
      <ErrorState
        v-else-if="error"
        description="书架暂时无法加载，请稍后再试。"
        @retry="refresh()"
      />
      <EmptyState
        v-else-if="visibleItems.length === 0"
        icon="i-lucide-book-open"
        :title="`${BOOKSHELF_STATUS_LABELS[activeStatus]}里还没有作品`"
        description="从书库或作品详情页加入一本小说吧。"
        action-label="浏览书库"
        action-to="/novels"
      />
      <div
        v-else
        class="bookshelf-list"
      >
        <article
          v-for="entry in visibleItems"
          :key="entry.shelf.novelId"
          class="bookshelf-item"
        >
          <NuxtLink
            :to="`/novels/${entry.novel!.id}`"
            class="bookshelf-item__cover"
          >
            <NovelNovelCover
              :title="entry.novel!.title"
              :tone="entry.novel!.coverTone"
            />
          </NuxtLink>
          <div class="bookshelf-item__body">
            <div class="bookshelf-item__title-row">
              <div>
                <NuxtLink :to="`/novels/${entry.novel!.id}`"><h2>{{ entry.novel!.title }}</h2></NuxtLink>
                <p>{{ entry.novel!.author.name }} · {{ entry.novel!.category.secondary }}</p>
              </div>
              <span
                v-if="entry.novel!.updatedAt > entry.shelf.updatedAt"
                class="bookshelf-item__updated"
              ><i />有更新</span>
            </div>
            <p class="bookshelf-item__progress">
              {{ progressLabel(entry.shelf.novelId) }}
            </p>
            <p class="bookshelf-item__chapter">
              最新章节：{{ entry.novel!.latestChapter.title }}
            </p>
            <div class="bookshelf-item__footer">
              <time :datetime="entry.novel!.updatedAt">{{ formatDate(entry.novel!.updatedAt) }} 更新</time>
              <div class="bookshelf-item__actions">
                <select
                  :value="entry.shelf.status"
                  aria-label="调整阅读状态"
                  @change="updateStatus(entry.shelf.novelId, ($event.target as HTMLSelectElement).value as BookshelfStatus)"
                >
                  <option
                    v-for="tab in tabs"
                    :key="tab.value"
                    :value="tab.value"
                  >
                    {{ tab.label }}
                  </option>
                </select>
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  aria-label="移出书架"
                  @click="remove(entry.shelf.novelId)"
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.bookshelf-page { padding: 3rem 0 5rem; }
.bookshelf-shell { max-width: 920px; }
.bookshelf-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }
.bookshelf-heading__actions { display: flex; gap: .5rem; }
.bookshelf-heading__eyebrow { color: var(--color-brand-700); font-size: .68rem; letter-spacing: .16em; }
.bookshelf-heading h1 { margin-top: .35rem; font-family: var(--font-reading); font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 600; }
.bookshelf-heading > div > p:last-child { margin-top: .5rem; color: var(--site-muted); font-size: .85rem; }
.bookshelf-notice { display: flex; gap: .75rem; margin-top: 2rem; padding: .85rem 1rem; border: 1px solid var(--color-brand-200); border-radius: .75rem; background: var(--color-brand-50); }
.bookshelf-notice > svg { flex: none; margin-top: .1rem; color: var(--color-brand-600); }
.bookshelf-notice p { display: grid; gap: .15rem; font-size: .8rem; }.bookshelf-notice span { color: var(--site-muted); }.bookshelf-notice a { color: var(--color-brand-700); }
.bookshelf-tabs { display: flex; gap: 1.5rem; margin: 2.25rem 0 1rem; border-bottom: 1px solid var(--site-line); }
.bookshelf-tabs button { display: flex; gap: .45rem; padding: .7rem .1rem; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--site-muted); cursor: pointer; }.bookshelf-tabs button.is-active { border-color: var(--color-brand-600); color: var(--site-ink); }.bookshelf-tabs span { font-size: .7rem; }
.bookshelf-list { display: grid; border-top: 1px solid var(--site-line); }
.bookshelf-item { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 1.1rem; padding: 1.25rem 0; border-bottom: 1px solid var(--site-line); }.bookshelf-item__cover :deep(.novel-cover) { width: 5rem; }
.bookshelf-item__body { min-width: 0; }.bookshelf-item__title-row, .bookshelf-item__footer { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }.bookshelf-item h2 { font-size: 1rem; font-weight: 600; }.bookshelf-item__title-row p, .bookshelf-item__chapter, .bookshelf-item__footer { color: var(--site-muted); font-size: .72rem; }.bookshelf-item__progress { margin-top: .8rem; font-size: .82rem; }.bookshelf-item__chapter { margin-top: .25rem; }.bookshelf-item__footer { align-items: center; margin-top: .7rem; }
.bookshelf-item__updated { flex: none; color: var(--color-brand-700); font-size: .7rem; }.bookshelf-item__updated i { display: inline-block; width: .4rem; height: .4rem; margin-right: .3rem; border-radius: 50%; background: var(--color-brand-500); }
.bookshelf-item__actions { display: flex; align-items: center; gap: .25rem; }.bookshelf-item__actions select { padding: .35rem .55rem; border: 1px solid var(--site-line); border-radius: .45rem; background: var(--site-surface); color: var(--site-ink); font-size: .72rem; }
@media (max-width: 600px) { .bookshelf-page { padding-top: 1.5rem; }.bookshelf-heading { align-items: flex-start; flex-direction: column; gap: 1rem; }.bookshelf-heading__actions { width: 100%; flex-wrap: wrap; }.bookshelf-tabs { gap: 1rem; overflow-x: auto; }.bookshelf-tabs button { flex: none; }.bookshelf-item { grid-template-columns: 4rem minmax(0, 1fr); }.bookshelf-item__cover :deep(.novel-cover) { width: 4rem; }.bookshelf-item__footer { align-items: flex-start; flex-direction: column; }.bookshelf-item__actions { width: 100%; justify-content: space-between; } }
</style>

<script setup lang="ts">
import type { BookshelfStatus } from '~/types/bookshelf'
import { BOOKSHELF_STATUS_LABELS } from '~/types/bookshelf'

const props = defineProps<{ view: 'bookshelf' | 'history' }>()
const emit = defineEmits<{ view: [value: 'bookshelf' | 'history'] }>()
const bookshelf = useBookshelfStore()
const following = useFollowingStore()
const progress = useReadingProgressStore()
const { data: novels, pending } = useNovelList()
const activeStatus = ref<BookshelfStatus>('reading')
const currentPage = ref(1)
const pageSize = 6
const selected = ref<string[]>([])
const tabs = (Object.keys(BOOKSHELF_STATUS_LABELS) as BookshelfStatus[]).map(value => ({ value, label: BOOKSHELF_STATUS_LABELS[value] }))
const shelfItems = computed(() => bookshelf.items.filter(item => item.status === activeStatus.value).map((shelf) => {
  const novel = novels.value?.find(novel => novel.id === shelf.novelId)
  return { shelf, novel, unread: novel ? following.unreadCount(novel.id, novel.updatedAt) : 0 }
}).filter(entry => entry.novel))
const pagedShelfItems = computed(() => shelfItems.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const history = computed(() => progress.progressList.map(item => ({ progress: item, novel: novels.value?.find(novel => novel.id === item.novelId) })).filter(entry => entry.novel))
const percent = (value: number) => Math.round(Math.min(1, Math.max(0, value)) * 100)
function toggleSelected(novelId: string) {
  selected.value = selected.value.includes(novelId) ? selected.value.filter(id => id !== novelId) : [...selected.value, novelId]
}
function removeSelected() {
  if (!selected.value.length || !window.confirm(`确定移出选中的 ${selected.value.length} 部作品吗？`)) return
  bookshelf.removeMany(selected.value)
  selected.value = []
}
function clearHistory() {
  if (window.confirm('确定清空全部阅读历史吗？此操作只影响当前前端数据。')) progress.clearAllProgress()
}
</script>

<template>
  <header><h1>阅读管理</h1><span>我的书架与阅读历史都在这里。</span></header>
  <div class="subsection-tabs">
    <button
      :class="{ active: props.view === 'bookshelf' }"
      @click="emit('view', 'bookshelf')"
    >
      我的书架
    </button><button
      :class="{ active: props.view === 'history' }"
      @click="emit('view', 'history')"
    >
      阅读历史
    </button>
  </div>
  <template v-if="props.view === 'bookshelf'">
    <nav
      class="filter-tabs"
      aria-label="书架分类"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeStatus === tab.value }"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }} <span>{{ bookshelf.items.filter(item => item.status === tab.value).length }}</span>
      </button>
    </nav>
    <LoadingSkeleton v-if="pending" />
    <div
      v-else-if="selected.length"
      class="batch-actions"
    >
      <span>已选择 {{ selected.length }} 项</span><UButton
        label="标为已读完"
        size="sm"
        variant="outline"
        @click="bookshelf.updateMany(selected, 'finished'); selected = []"
      /><UButton
        label="移出书架"
        size="sm"
        color="error"
        variant="ghost"
        @click="removeSelected"
      />
    </div>
    <EmptyState
      v-else-if="!shelfItems.length"
      icon="i-lucide-bookmark"
      :title="`${BOOKSHELF_STATUS_LABELS[activeStatus]}里还没有作品`"
      description="从书库或作品详情页加入一本小说吧。"
      action-label="浏览书库"
      action-to="/novels"
    />
    <div
      v-else
      class="reading-list"
    >
      <article
        v-for="entry in pagedShelfItems"
        :key="entry.shelf.novelId"
        class="shelf-entry"
      >
        <UCheckbox
          :model-value="selected.includes(entry.shelf.novelId)"
          aria-label="选择作品"
          @update:model-value="toggleSelected(entry.shelf.novelId)"
        />
        <NovelCover
          :title="entry.novel!.title"
          :tone="entry.novel!.coverTone"
        />
        <div><NuxtLink :to="`/novels/${entry.novel!.id}`"><strong>{{ entry.novel!.title }}</strong><em v-if="entry.unread">{{ entry.unread }} 条未读更新</em></NuxtLink><span>{{ entry.novel!.author.name }} · {{ entry.novel!.latestChapter.title }}</span></div>
        <div class="item-actions">
          <select
            :value="entry.shelf.status"
            aria-label="调整阅读状态"
            @change="bookshelf.updateStatus(entry.shelf.novelId, ($event.target as HTMLSelectElement).value as BookshelfStatus)"
          >
            <option
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
            >
              {{ tab.label }}
            </option>
          </select><UButton
            :icon="following.getNovelPreference(entry.shelf.novelId)?.notificationsEnabled ? 'i-lucide-bell-ring' : 'i-lucide-bell-off'"
            color="neutral"
            variant="ghost"
            :aria-label="following.getNovelPreference(entry.shelf.novelId)?.notificationsEnabled ? '关闭作品更新通知' : '开启作品更新通知'"
            @click="following.setNovelNotifications(entry.shelf.novelId, !following.getNovelPreference(entry.shelf.novelId)?.notificationsEnabled, entry.novel!.updatedAt)"
          /><UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            aria-label="移出书架"
            @click="bookshelf.remove(entry.shelf.novelId)"
          />
        </div>
      </article>
    </div>
    <UPagination
      v-if="shelfItems.length > pageSize"
      v-model:page="currentPage"
      :total="shelfItems.length"
      :items-per-page="pageSize"
    />
  </template>
  <template v-else>
    <div
      v-if="history.length"
      class="history-actions"
    >
      <UButton
        label="清空阅读历史"
        color="error"
        variant="ghost"
        size="sm"
        @click="clearHistory"
      />
    </div>
    <EmptyState
      v-if="!history.length"
      icon="i-lucide-history"
      title="还没有阅读足迹"
      description="打开任意公开章节后，阅读位置会保存在这里。"
      action-label="去书库找故事"
      action-to="/novels"
    />
    <div
      v-else
      class="reading-list history-list"
    >
      <article
        v-for="entry in history"
        :key="entry.progress.novelId"
      >
        <div class="history-icon">
          <UIcon name="i-lucide-history" />
        </div>
        <div><strong>{{ entry.novel!.title }}</strong><span>{{ entry.progress.chapterTitle ?? `章节 ${entry.progress.chapterId}` }} · 本章 {{ percent(entry.progress.scrollRatio) }}%</span></div>
        <div class="item-actions">
          <UButton
            :to="`/novels/${entry.progress.novelId}/chapters/${entry.progress.chapterId}`"
            label="继续阅读"
            size="sm"
            variant="outline"
          /><UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            aria-label="删除阅读记录"
            @click="progress.clearProgress(entry.progress.novelId)"
          />
        </div>
      </article>
    </div>
  </template>
</template>

<style scoped>
.reading-list .shelf-entry{grid-template-columns:auto 3.5rem minmax(0,1fr) auto}.reading-list em{margin-left:.45rem;padding:.12rem .35rem;border-radius:999px;background:var(--color-brand-100);color:var(--color-brand-800);font-size:.65rem;font-style:normal}.batch-actions,.history-actions{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;margin:1rem 0}.batch-actions span{margin-right:auto;color:var(--site-muted);font-size:.75rem}
</style>

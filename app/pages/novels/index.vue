<script setup lang="ts">
import type { NovelSort, NovelSearchQuery } from '~/composables/useNovels'
import type { Tag } from '~/types/novel'

useSeoMeta({
  title: '书库｜若林轻小说',
  description: '按分类、状态、标签和排序浏览若林轻小说的全部作品。'
})

const route = useRoute()
const router = useRouter()

const { data: categories } = useCategoryTree()
const { data: allNovels } = useNovelList()

// 可用标签：从全部小说中收集去重，避免在 fixtures 里维护两份。
const allTags = computed<Tag[]>(() => {
  const map = new Map<string, Tag>()
  for (const novel of allNovels.value ?? []) {
    for (const tag of novel.tags) map.set(tag.id, tag)
  }
  return Array.from(map.values())
})

const sortOptions: { value: NovelSort, label: string }[] = [
  { value: 'updated', label: '最近更新' },
  { value: 'wordCount', label: '字数最多' },
  { value: 'debut', label: '新作优先' },
  { value: 'latestChapter', label: '最新章节' }
]

// 当前筛选条件：从 URL query 初始化，任意变化时同步回 URL（replace 避免历史堆栈）。
const selectedCategory = ref<string>((route.query.category as string) || '')
const selectedSubcategory = ref<string>((route.query.subcategory as string) || '')
const statusFromQuery = route.query.status
const initialStatus
  = statusFromQuery === 'serializing' || statusFromQuery === 'completed'
    ? statusFromQuery
    : ''
const selectedStatus = ref<'serializing' | 'completed' | ''>(initialStatus)
const selectedTag = ref<string>((route.query.tag as string) || '')
const selectedSort = ref<NovelSort>((route.query.sort as NovelSort) || 'updated')

const currentCategory = computed(() =>
  categories.value?.find(c => c.slug === selectedCategory.value)
)

function syncUrl() {
  const query: Record<string, string> = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (selectedSubcategory.value) query.subcategory = selectedSubcategory.value
  if (selectedStatus.value) query.status = selectedStatus.value
  if (selectedTag.value) query.tag = selectedTag.value
  if (selectedSort.value && selectedSort.value !== 'updated') query.sort = selectedSort.value
  router.replace({ query })
}

watch([selectedCategory, selectedSubcategory, selectedStatus, selectedTag, selectedSort], syncUrl)

// 一级分类切换时清空跨一级残留的二级选择。
watch(selectedCategory, () => {
  const stillValid = currentCategory.value?.children.some(c => c.slug === selectedSubcategory.value)
  if (selectedSubcategory.value && !stillValid) selectedSubcategory.value = ''
})

const query = computed<NovelSearchQuery>(() => ({
  category: selectedCategory.value || undefined,
  subcategory: selectedSubcategory.value || undefined,
  status: selectedStatus.value || undefined,
  tag: selectedTag.value || undefined,
  sort: selectedSort.value
}))

const { data: novels, pending, error, refresh } = useNovelSearch(query)

interface ActiveChip { key: string, label: string, clear: () => void }
const activeChips = computed<ActiveChip[]>(() => {
  const chips: ActiveChip[] = []
  if (selectedCategory.value && currentCategory.value) {
    chips.push({
      key: 'category',
      label: currentCategory.value.name,
      clear: () => {
        selectedCategory.value = ''
        selectedSubcategory.value = ''
      }
    })
  }
  if (selectedSubcategory.value && currentCategory.value) {
    const sub = currentCategory.value.children.find(c => c.slug === selectedSubcategory.value)
    if (sub) {
      chips.push({
        key: 'subcategory',
        label: sub.name,
        clear: () => { selectedSubcategory.value = '' }
      })
    }
  }
  if (selectedStatus.value) {
    chips.push({
      key: 'status',
      label: selectedStatus.value === 'serializing' ? '连载中' : '已完结',
      clear: () => { selectedStatus.value = '' }
    })
  }
  if (selectedTag.value) {
    const tag = allTags.value.find(t => t.id === selectedTag.value)
    if (tag) {
      chips.push({
        key: 'tag',
        label: tag.name,
        clear: () => { selectedTag.value = '' }
      })
    }
  }
  return chips
})

function clearAll() {
  selectedCategory.value = ''
  selectedSubcategory.value = ''
  selectedStatus.value = ''
  selectedTag.value = ''
  selectedSort.value = 'updated'
}

const mobileFilterOpen = ref(false)
</script>

<template>
  <div class="library-page">
    <div class="site-container">
      <header class="library-header">
        <div>
          <h1>书库</h1>
          <p>按分类、状态、标签慢慢挑，总能遇到合心意的故事。</p>
        </div>
        <UButton
          class="mobile-filter-trigger"
          icon="i-lucide-sliders-horizontal"
          color="neutral"
          variant="outline"
          label="筛选"
          @click="mobileFilterOpen = true"
        />
      </header>

      <div class="library-layout">
        <aside class="library-sidebar">
          <div class="filter-group">
            <h3>一级分类</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedCategory }"
              @click="selectedCategory = ''; selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="cat in categories ?? []"
              :key="cat.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedCategory === cat.slug }"
              @click="selectedCategory = cat.slug; selectedSubcategory = ''"
            >
              <UIcon :name="cat.icon || 'i-lucide-bookmark'" />
              <span>{{ cat.name }}</span>
              <em>{{ cat.novelCount }}</em>
            </button>
          </div>

          <div
            v-if="currentCategory?.children?.length"
            class="filter-group"
          >
            <h3>{{ currentCategory.name }} · 二级分类</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedSubcategory }"
              @click="selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="sub in currentCategory.children"
              :key="sub.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedSubcategory === sub.slug }"
              @click="selectedSubcategory = sub.slug"
            >
              <span>{{ sub.name }}</span>
              <em>{{ sub.novelCount }}</em>
            </button>
          </div>

          <div class="filter-group">
            <h3>完结状态</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedStatus }"
              @click="selectedStatus = ''"
            >
              全部
            </button>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedStatus === 'serializing' }"
              @click="selectedStatus = 'serializing'"
            >
              连载中
            </button>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedStatus === 'completed' }"
              @click="selectedStatus = 'completed'"
            >
              已完结
            </button>
          </div>

          <div
            v-if="allTags.length"
            class="filter-group"
          >
            <h3>标签</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedTag }"
              @click="selectedTag = ''"
            >
              全部
            </button>
            <button
              v-for="tag in allTags"
              :key="tag.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedTag === tag.id }"
              @click="selectedTag = tag.id"
            >
              <span>{{ tag.name }}</span>
            </button>
          </div>
        </aside>

        <section class="library-main">
          <div class="library-toolbar">
            <div class="library-toolbar__sort">
              <span>排序</span>
              <div class="library-toolbar__sort-buttons">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  type="button"
                  class="sort-button"
                  :class="{ 'is-active': selectedSort === opt.value }"
                  @click="selectedSort = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="activeChips.length"
            class="library-chips"
          >
            <span
              v-for="chip in activeChips"
              :key="chip.key"
              class="library-chip"
            >
              {{ chip.label }}
              <button
                type="button"
                aria-label="移除筛选"
                @click="chip.clear()"
              >
                <UIcon name="i-lucide-x" />
              </button>
            </span>
            <button
              type="button"
              class="library-chip-clear"
              @click="clearAll"
            >
              清除全部
            </button>
          </div>

          <ErrorState
            v-if="error"
            :description="error.statusMessage || '无法加载书库，请稍后重试。'"
            @retry="refresh()"
          />
          <LoadingSkeleton
            v-else-if="pending"
            variant="card"
            :rows="6"
          />
          <div
            v-else-if="novels && novels.length"
            class="novel-grid library-grid"
          >
            <NovelNovelCard
              v-for="novel in novels"
              :key="novel.id"
              :novel="novel"
            />
          </div>
          <EmptyState
            v-else
            icon="i-lucide-search-x"
            title="没有符合条件的故事"
            description="试着放宽筛选条件，或者清除全部筛选重新看看。"
          >
            <UButton
              label="清除全部筛选"
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="outline"
              @click="clearAll"
            />
          </EmptyState>
        </section>
      </div>
    </div>

    <USlideover
      v-model:open="mobileFilterOpen"
      title="筛选"
      description="按分类、状态、标签筛选作品。"
    >
      <template #body>
        <div class="mobile-filter">
          <div class="filter-group">
            <h3>一级分类</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedCategory }"
              @click="selectedCategory = ''; selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="cat in categories ?? []"
              :key="cat.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedCategory === cat.slug }"
              @click="selectedCategory = cat.slug; selectedSubcategory = ''"
            >
              <UIcon :name="cat.icon || 'i-lucide-bookmark'" />
              <span>{{ cat.name }}</span>
            </button>
          </div>
          <div
            v-if="currentCategory?.children?.length"
            class="filter-group"
          >
            <h3>二级分类</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedSubcategory }"
              @click="selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="sub in currentCategory.children"
              :key="sub.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedSubcategory === sub.slug }"
              @click="selectedSubcategory = sub.slug"
            >
              {{ sub.name }}
            </button>
          </div>
          <div class="filter-group">
            <h3>完结状态</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedStatus }"
              @click="selectedStatus = ''"
            >
              全部
            </button>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedStatus === 'serializing' }"
              @click="selectedStatus = 'serializing'"
            >
              连载中
            </button>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedStatus === 'completed' }"
              @click="selectedStatus = 'completed'"
            >
              已完结
            </button>
          </div>
          <div
            v-if="allTags.length"
            class="filter-group"
          >
            <h3>标签</h3>
            <button
              type="button"
              class="filter-item"
              :class="{ 'is-active': !selectedTag }"
              @click="selectedTag = ''"
            >
              全部
            </button>
            <button
              v-for="tag in allTags"
              :key="tag.id"
              type="button"
              class="filter-item"
              :class="{ 'is-active': selectedTag === tag.id }"
              @click="selectedTag = tag.id"
            >
              {{ tag.name }}
            </button>
          </div>
          <div class="mobile-filter__actions">
            <UButton
              label="清除全部"
              color="neutral"
              variant="outline"
              block
              @click="clearAll"
            />
            <UButton
              label="查看结果"
              block
              @click="mobileFilterOpen = false"
            />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
.library-page { padding: 1.5rem 0 4rem; }
.library-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.75rem; }
.library-header h1 { margin: 0; font-family: var(--font-reading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 600; }
.library-header p { margin: .35rem 0 0; color: var(--site-muted); font-size: .85rem; }
.mobile-filter-trigger { display: none; }

.library-layout { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 2.5rem; align-items: start; }
.library-sidebar { position: sticky; top: calc(var(--site-header-height) + 1rem); display: grid; gap: 1.5rem; }
.filter-group { display: grid; gap: .15rem; }
.filter-group h3 { margin: 0 0 .4rem; font-size: .7rem; font-weight: 600; color: var(--site-muted); letter-spacing: .1em; text-transform: uppercase; }
.filter-item { display: flex; align-items: center; gap: .5rem; padding: .5rem .65rem; border: 0; border-radius: .5rem; background: transparent; color: var(--site-ink); font-size: .85rem; text-align: left; cursor: pointer; }
.filter-item:hover { background: var(--color-brand-50); }
.filter-item.is-active { background: var(--color-brand-100); color: var(--color-brand-800); font-weight: 600; }
.filter-item em { margin-left: auto; color: var(--site-muted); font-style: normal; font-size: .7rem; }

.library-main { min-width: 0; }
.library-toolbar { display: flex; justify-content: flex-end; margin-bottom: 1.1rem; }
.library-toolbar__sort { display: flex; align-items: center; gap: .65rem; }
.library-toolbar__sort > span { color: var(--site-muted); font-size: .8rem; }
.library-toolbar__sort-buttons { display: inline-flex; gap: .15rem; padding: .2rem; border: 1px solid var(--site-line); border-radius: 999px; background: var(--site-surface); }
.sort-button { padding: .35rem .8rem; border: 0; border-radius: 999px; background: transparent; color: var(--site-muted); font-size: .75rem; cursor: pointer; }
.sort-button.is-active { background: var(--color-brand-600); color: white; }

.library-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-bottom: 1.25rem; }
.library-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .25rem .65rem; border: 1px solid var(--color-brand-200); border-radius: 999px; background: var(--color-brand-50); color: var(--color-brand-800); font-size: .75rem; }
.library-chip button { display: inline-flex; align-items: center; justify-content: center; width: 1.05rem; height: 1.05rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-brand-700); cursor: pointer; }
.library-chip button:hover { background: var(--color-brand-200); }
.library-chip-clear { margin-left: .35rem; padding: 0; border: 0; background: transparent; color: var(--site-muted); font-size: .75rem; cursor: pointer; }
.library-chip-clear:hover { color: var(--color-brand-700); }

.library-grid { grid-template-columns: repeat(2, 1fr); }

.mobile-filter { display: grid; gap: 1.5rem; }
.mobile-filter__actions { display: grid; gap: .5rem; margin-top: .5rem; }

@media (max-width: 900px) {
  .library-layout { grid-template-columns: 1fr; }
  .library-sidebar { display: none; }
  .mobile-filter-trigger { display: inline-flex; }
  .library-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 639px) {
  .library-grid { grid-template-columns: 1fr; }
  .library-toolbar__sort { flex-wrap: wrap; }
}
</style>

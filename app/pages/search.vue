<script setup lang="ts">
import type { NovelSearchQuery } from '~/composables/useNovels'

useSeoMeta({
  title: '搜索｜若林轻小说',
  description: '搜索若林轻小说的作品、作者和标签。'
})

const route = useRoute()
const router = useRouter()

const { data: categories } = useCategoryTree()

const keyword = ref<string>((route.query.q as string) || '')
const committedKeyword = ref<string>(keyword.value)
const selectedCategory = ref<string>((route.query.category as string) || '')
const selectedSubcategory = ref<string>((route.query.subcategory as string) || '')
const activeTab = ref<'novels' | 'users'>((route.query.tab as 'novels' | 'users') || 'novels')

// 输入防抖：300ms 后把 keyword 提交到 committedKeyword；Enter 时跳过防抖。
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(keyword, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    committedKeyword.value = value
  }, 300)
})

function commitNow() {
  if (debounceTimer) clearTimeout(debounceTimer)
  committedKeyword.value = keyword.value
}

// 提交时同步 URL 并写入历史。
watch(committedKeyword, (value) => {
  syncUrl()
  if (value.trim()) pushHistory(value.trim())
})

function syncUrl() {
  const query: Record<string, string> = {}
  if (committedKeyword.value) query.q = committedKeyword.value
  if (selectedCategory.value) query.category = selectedCategory.value
  if (selectedSubcategory.value) query.subcategory = selectedSubcategory.value
  if (activeTab.value !== 'novels') query.tab = activeTab.value
  router.replace({ query })
}

watch([selectedCategory, selectedSubcategory, activeTab], syncUrl)

const currentCategory = computed(() =>
  categories.value?.find(c => c.slug === selectedCategory.value)
)
watch(selectedCategory, () => {
  const stillValid = currentCategory.value?.children.some(c => c.slug === selectedSubcategory.value)
  if (selectedSubcategory.value && !stillValid) selectedSubcategory.value = ''
})

const query = computed<NovelSearchQuery>(() => ({
  q: committedKeyword.value || undefined,
  category: selectedCategory.value || undefined,
  subcategory: selectedSubcategory.value || undefined,
  sort: 'updated'
}))

const { data: novels, pending, error, refresh } = useNovelSearch(query)

const HISTORY_KEY = 'wakabayashi-search-history'
const HISTORY_MAX = 10
const searchHistory = ref<string[]>([])

function loadHistory(): string[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(x => typeof x === 'string').slice(0, HISTORY_MAX)
    }
  } catch {
    // 损坏数据忽略。
  }
  return []
}

function pushHistory(term: string) {
  if (!import.meta.client) return
  const next = [term, ...searchHistory.value.filter(x => x !== term)].slice(0, HISTORY_MAX)
  searchHistory.value = next
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    // 容量超限静默失败。
  }
}

function clearHistory() {
  searchHistory.value = []
  if (import.meta.client) {
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // 忽略。
    }
  }
}

onMounted(() => {
  searchHistory.value = loadHistory()
})

// 热门建议：从 fixtures 标题/标签中派生，不泄露其他用户行为。
const hotSuggestions = ['雨季', '咖啡馆', '银河', '灯', '信']

function applyTerm(term: string) {
  keyword.value = term
  commitNow()
}

const hasQuery = computed(() => committedKeyword.value.trim().length > 0)
</script>

<template>
  <div class="search-page">
    <div class="site-container">
      <header class="search-header">
        <h1>搜索</h1>
        <p>搜作品、作者或标签，找到属于你的下一个故事。</p>
      </header>

      <div class="search-input-row">
        <UInput
          v-model="keyword"
          icon="i-lucide-search"
          placeholder="输入作品名、作者或标签……"
          size="xl"
          class="search-input"
          autofocus
          @keydown.enter="commitNow"
        >
          <template
            v-if="keyword"
            #trailing
          >
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="link"
              aria-label="清空"
              @click="keyword = ''; commitNow()"
            />
          </template>
        </UInput>
      </div>

      <div class="search-tabs">
        <button
          type="button"
          class="search-tab"
          :class="{ 'is-active': activeTab === 'novels' }"
          @click="activeTab = 'novels'"
        >
          小说
        </button>
        <button
          type="button"
          class="search-tab"
          :class="{ 'is-active': activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          用户
        </button>
      </div>

      <template v-if="activeTab === 'novels'">
        <div
          v-if="hasQuery"
          class="search-filters"
        >
          <div class="search-filter-group">
            <span>分类：</span>
            <button
              type="button"
              class="search-filter-item"
              :class="{ 'is-active': !selectedCategory }"
              @click="selectedCategory = ''; selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="cat in categories ?? []"
              :key="cat.id"
              type="button"
              class="search-filter-item"
              :class="{ 'is-active': selectedCategory === cat.slug }"
              @click="selectedCategory = cat.slug; selectedSubcategory = ''"
            >
              {{ cat.name }}
            </button>
          </div>
          <div
            v-if="currentCategory?.children?.length"
            class="search-filter-group"
          >
            <span>二级：</span>
            <button
              type="button"
              class="search-filter-item"
              :class="{ 'is-active': !selectedSubcategory }"
              @click="selectedSubcategory = ''"
            >
              全部
            </button>
            <button
              v-for="sub in currentCategory.children"
              :key="sub.id"
              type="button"
              class="search-filter-item"
              :class="{ 'is-active': selectedSubcategory === sub.slug }"
              @click="selectedSubcategory = sub.slug"
            >
              {{ sub.name }}
            </button>
          </div>
        </div>

        <ErrorState
          v-if="error"
          :description="error.statusMessage || '搜索失败，请稍后重试。'"
          @retry="refresh()"
        />
        <LoadingSkeleton
          v-else-if="pending && hasQuery"
          variant="card"
          :rows="4"
        />
        <template v-else-if="hasQuery">
          <p
            v-if="novels && novels.length"
            class="search-result-count"
          >
            找到 {{ novels.length }} 部相关作品
          </p>
          <div
            v-if="novels && novels.length"
            class="novel-grid search-grid"
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
            title="没有找到相关作品"
            description="换个关键词试试，或者去掉一些筛选条件。"
          />
        </template>

        <section
          v-else
          class="search-suggest"
        >
          <div
            v-if="searchHistory.length"
            class="search-suggest-block"
          >
            <div class="search-suggest-block__head">
              <h2>最近搜索</h2>
              <button
                type="button"
                class="search-suggest-clear"
                @click="clearHistory"
              >
                清除
              </button>
            </div>
            <div class="search-suggest-chips">
              <button
                v-for="term in searchHistory"
                :key="term"
                type="button"
                class="search-suggest-chip"
                @click="applyTerm(term)"
              >
                {{ term }}
              </button>
            </div>
          </div>
          <div class="search-suggest-block">
            <h2>热门建议</h2>
            <p class="search-suggest-hint">
              这里只展示一些常被搜索的词，不会记录任何用户的个人搜索行为。
            </p>
            <div class="search-suggest-chips">
              <button
                v-for="term in hotSuggestions"
                :key="term"
                type="button"
                class="search-suggest-chip search-suggest-chip--hot"
                @click="applyTerm(term)"
              >
                {{ term }}
              </button>
            </div>
          </div>
        </section>
      </template>

      <EmptyState
        v-else
        icon="i-lucide-user-search"
        title="用户搜索暂未开放"
        description="目前先专注于作品发现；用户公开主页可以在阶段 4 后期通过作者入口到达。"
      />
    </div>
  </div>
</template>

<style scoped>
.search-page { padding: 1.5rem 0 4rem; }
.search-header { margin-bottom: 1.5rem; }
.search-header h1 { margin: 0; font-family: var(--font-reading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 600; }
.search-header p { margin: .35rem 0 0; color: var(--site-muted); font-size: .85rem; }

.search-input-row { margin-bottom: 1.25rem; }
.search-input { width: 100%; }

.search-tabs { display: inline-flex; gap: .25rem; margin-bottom: 1.5rem; padding: .2rem; border: 1px solid var(--site-line); border-radius: 999px; background: var(--site-surface); }
.search-tab { padding: .4rem 1rem; border: 0; border-radius: 999px; background: transparent; color: var(--site-muted); font-size: .8rem; cursor: pointer; }
.search-tab.is-active { background: var(--color-brand-600); color: white; }

.search-filters { display: grid; gap: .65rem; margin-bottom: 1.5rem; padding: 1rem 1.25rem; border: 1px solid var(--site-line); border-radius: .75rem; background: var(--site-surface); }
.search-filter-group { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
.search-filter-group > span { color: var(--site-muted); font-size: .75rem; }
.search-filter-item { padding: .25rem .65rem; border: 1px solid var(--site-line); border-radius: 999px; background: transparent; color: var(--site-ink); font-size: .75rem; cursor: pointer; }
.search-filter-item:hover { border-color: var(--color-brand-300); }
.search-filter-item.is-active { background: var(--color-brand-100); border-color: var(--color-brand-300); color: var(--color-brand-800); }

.search-result-count { margin: 0 0 1rem; color: var(--site-muted); font-size: .8rem; }
.search-grid { grid-template-columns: repeat(2, 1fr); }

.search-suggest { display: grid; gap: 1.75rem; max-width: 48rem; }
.search-suggest-block { display: grid; gap: .75rem; }
.search-suggest-block__head { display: flex; align-items: center; justify-content: space-between; }
.search-suggest-block h2 { margin: 0; font-size: .95rem; font-weight: 600; }
.search-suggest-hint { margin: -.25rem 0 0; color: var(--site-muted); font-size: .75rem; }
.search-suggest-clear { padding: 0; border: 0; background: transparent; color: var(--site-muted); font-size: .75rem; cursor: pointer; }
.search-suggest-clear:hover { color: var(--color-brand-700); }
.search-suggest-chips { display: flex; flex-wrap: wrap; gap: .5rem; }
.search-suggest-chip { padding: .35rem .85rem; border: 1px solid var(--site-line); border-radius: 999px; background: var(--site-surface); color: var(--site-ink); font-size: .8rem; cursor: pointer; }
.search-suggest-chip:hover { border-color: var(--color-brand-300); color: var(--color-brand-700); }
.search-suggest-chip--hot { border-color: var(--color-brand-200); background: var(--color-brand-50); color: var(--color-brand-800); }

@media (max-width: 900px) {
  .search-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 639px) {
  .search-grid { grid-template-columns: 1fr; }
}
</style>

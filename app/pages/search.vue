<script setup lang="ts">
import { publicUsers } from '~/fixtures/users'

useSeoMeta({
  title: '搜索｜若林轻小说',
  description: '搜索若林轻小说的作品、作者和标签。'
})

const { data: categories } = useCategoryTree()
const { keyword, selectedCategory, selectedSubcategory, activeTab, currentCategory, query, hasQuery, searchHistory, commitNow, clearHistory, applyTerm } = useSearchQuery(categories)

const { data: novels, pending, error, refresh } = useNovelSearch(query)

// 热门建议：从 fixtures 标题/标签中派生，不泄露其他用户行为。
const hotSuggestions = ['雨季', '咖啡馆', '银河', '灯', '信']
const matchedUsers = computed(() => {
  const terms = keyword.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return publicUsers
  return publicUsers.filter((user) => {
    const text = `${user.name} ${user.bio ?? ''} ${user.role}`.toLocaleLowerCase()
    return terms.every(term => text.includes(term))
  })
})
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
          <NovelSearchResults
            v-if="novels && novels.length"
            :novels="novels"
            :query="keyword"
          />
          <EmptyState
            v-else
            icon="i-lucide-search-x"
            title="没有找到相关作品"
            description="换个关键词试试，或者去掉一些筛选条件。"
          />
        </template>

        <SearchSuggestions
          v-else
          :history="searchHistory"
          :hot="hotSuggestions"
          @select="applyTerm"
          @clear="clearHistory"
        />
      </template>

      <UserSearchResults
        v-else
        :users="matchedUsers"
        :query="keyword"
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

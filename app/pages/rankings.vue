<script setup lang="ts">
import type { NovelSummary } from '~/types/novel'

useSeoMeta({
  title: '排行｜若林轻小说',
  description: '看看最近哪些故事被读得最多、长得最快。'
})

const route = useRoute()
const router = useRouter()

type RankingTab = 'hot' | 'bookshelf' | 'debut' | 'completed'

const tabs: { value: RankingTab, label: string, description: string }[] = [
  { value: 'hot', label: '热门', description: '综合阅读活跃度和最近更新。' },
  { value: 'bookshelf', label: '收藏增长', description: '最近被更多读者加入书架的作品。' },
  { value: 'debut', label: '新作', description: '还在悄悄成长的小作品。' },
  { value: 'completed', label: '完结佳作', description: '可以一口气读完的完整故事。' }
]

const activeTab = ref<RankingTab>((route.query.tab as RankingTab) || 'hot')

watch(activeTab, (value) => {
  const query: Record<string, string> = {}
  if (value !== 'hot') query.tab = value
  router.replace({ query })
})

const { data: allNovels, pending, error, refresh } = useNovelList()

// fixtures 阶段没有真实热度/收藏增长数据，用稳定可解释的派生指标代替；
// 阶段 8 接入真实 API 时，每个 tab 会调用对应的排行接口。
const rankedNovels = computed<NovelSummary[]>(() => {
  const list = [...(allNovels.value ?? [])]
  switch (activeTab.value) {
    case 'bookshelf':
      // 没有 bookshelfCount 字段时，用字数作为弱代理（更长更易被收藏）。
      return list.sort((a, b) => b.wordCount - a.wordCount)
    case 'debut':
      return list
        .filter(n => n.status === 'serializing')
        .sort((a, b) => a.wordCount - b.wordCount)
    case 'completed':
      return list
        .filter(n => n.status === 'completed')
        .sort((a, b) => b.wordCount - a.wordCount)
    case 'hot':
    default:
      // 热门：最近更新优先，字数次之。
      return list.sort((a, b) => {
        const timeDiff = b.updatedAt.localeCompare(a.updatedAt)
        if (timeDiff !== 0) return timeDiff
        return b.wordCount - a.wordCount
      })
  }
})

const currentTabMeta = computed(() => tabs.find(t => t.value === activeTab.value)!)

const today = new Date()
const periodLabel = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月`
const updatedLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function formatWordCount(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 万字` : `${n.toLocaleString('zh-CN')} 字`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div class="rankings-page">
    <div class="site-container">
      <header class="rankings-header">
        <div>
          <h1>排行</h1>
          <p>排行只是发现辅助，挑一本喜欢的慢慢读就好。</p>
        </div>
        <p class="rankings-meta">
          统计周期：{{ periodLabel }} · 数据更新于 {{ updatedLabel }}
        </p>
      </header>

      <div class="rankings-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="rankings-tab"
          :class="{ 'is-active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <p class="rankings-tab-desc">
        {{ currentTabMeta.description }}
      </p>

      <ErrorState
        v-if="error"
        :description="error.statusMessage || '无法加载排行，请稍后重试。'"
        @retry="refresh()"
      />
      <LoadingSkeleton
        v-else-if="pending"
        variant="list"
        :rows="5"
      />
      <template v-else-if="rankedNovels.length">
        <ol class="rankings-list">
          <li
            v-for="(novel, index) in rankedNovels"
            :key="novel.id"
            class="ranking-item"
            :class="{ 'is-top': index < 3 }"
          >
            <span class="ranking-item__rank">{{ index + 1 }}</span>
            <NuxtLink
              :to="`/novels/${novel.id}`"
              class="ranking-item__cover"
            >
              <NovelCover
                :title="novel.title"
                :tone="novel.coverTone"
              />
            </NuxtLink>
            <div class="ranking-item__body">
              <NuxtLink
                :to="`/novels/${novel.id}`"
                class="ranking-item__title"
              >
                {{ novel.title }}
              </NuxtLink>
              <p class="ranking-item__meta">
                <NuxtLink :to="`/users/${novel.author.id}`">{{ novel.author.name }}</NuxtLink><span>·</span><span>{{ novel.category.primary }} / {{ novel.category.secondary }}</span><span>·</span><span>{{ novel.status === 'serializing' ? '连载中' : '已完结' }}</span>
              </p>
              <p class="ranking-item__chapter">
                最新：{{ novel.latestChapter.title }} · {{ formatDate(novel.updatedAt) }}
              </p>
            </div>
            <div class="ranking-item__stat">
              <span class="ranking-item__stat-value">{{ formatWordCount(novel.wordCount) }}</span>
              <span class="ranking-item__stat-label">总字数</span>
            </div>
          </li>
        </ol>
      </template>
      <EmptyState
        v-else
        icon="i-lucide-trophy"
        title="这个榜单暂时还没有作品"
        description="换一个榜单看看，或者去书库慢慢逛逛。"
      />
    </div>
  </div>
</template>

<style scoped>
.rankings-page { padding: 1.5rem 0 4rem; }
.rankings-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.rankings-header h1 { margin: 0; font-family: var(--font-reading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 600; }
.rankings-header p { margin: .35rem 0 0; color: var(--site-muted); font-size: .85rem; }
.rankings-meta { margin: 0; color: var(--site-muted); font-size: .72rem; }

.rankings-tabs { display: inline-flex; flex-wrap: wrap; gap: .25rem; margin-bottom: .75rem; padding: .2rem; border: 1px solid var(--site-line); border-radius: 999px; background: var(--site-surface); }
.rankings-tab { padding: .4rem 1rem; border: 0; border-radius: 999px; background: transparent; color: var(--site-muted); font-size: .8rem; cursor: pointer; }
.rankings-tab.is-active { background: var(--color-brand-600); color: white; }
.rankings-tab-desc { margin: 0 0 1.5rem; color: var(--site-muted); font-size: .8rem; }

.rankings-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.ranking-item { display: grid; grid-template-columns: 2.5rem 4rem minmax(0, 1fr) auto; align-items: center; gap: 1rem; padding: .9rem 1.1rem; border: 1px solid var(--site-line); border-radius: .75rem; background: var(--site-surface); }
.ranking-item.is-top { border-color: var(--color-brand-300); background: color-mix(in srgb, var(--color-brand-50) 60%, var(--site-surface)); }
.ranking-item__rank { display: grid; place-items: center; width: 2rem; height: 2rem; border: 1px solid var(--site-line); border-radius: 50%; color: var(--site-muted); font-family: var(--font-reading); font-size: .95rem; }
.ranking-item.is-top .ranking-item__rank { border-color: var(--color-brand-400); color: var(--color-brand-700); background: var(--site-surface); }
.ranking-item__cover { display: block; width: 4rem; }
.ranking-item__body { min-width: 0; }
.ranking-item__title { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .95rem; font-weight: 600; color: var(--site-ink); }
.ranking-item__title:hover { color: var(--color-brand-700); }
.ranking-item__meta { display: flex; flex-wrap: wrap; gap: .35rem; margin: .25rem 0 0; color: var(--site-muted); font-size: .72rem; }
.ranking-item__meta a { color: var(--color-brand-700); }
.ranking-item__chapter { margin: .15rem 0 0; color: var(--site-muted); font-size: .72rem; }
.ranking-item__stat { display: grid; justify-items: end; gap: .15rem; padding-left: .75rem; border-left: 1px solid var(--site-line); }
.ranking-item__stat-value { font-size: .85rem; font-weight: 600; color: var(--color-brand-700); }
.ranking-item__stat-label { color: var(--site-muted); font-size: .65rem; }

@media (max-width: 639px) {
  .ranking-item { grid-template-columns: 2rem 3.5rem minmax(0, 1fr); gap: .75rem; padding: .8rem .9rem; }
  .ranking-item__stat { display: none; }
  .ranking-item__rank { width: 1.75rem; height: 1.75rem; font-size: .85rem; }
  .ranking-item__cover { width: 3.5rem; }
  .ranking-item__chapter { display: none; }
}
</style>

<script setup lang="ts">
import type { Category, NovelSummary } from '~/types/novel'

defineProps<{
  featured: NovelSummary[]
  recent: NovelSummary[]
  debut: NovelSummary[]
  categories: Category[]
  pending: boolean
  error?: string
}>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="home-section">
    <div class="site-container">
      <div class="home-section__heading">
        <div><h2>编辑推荐</h2><p>一些值得慢慢读下去的故事。</p></div><NuxtLink
          to="/novels"
          class="home-section__link"
        >查看全部 →</NuxtLink>
      </div>
      <ErrorState
        v-if="error"
        :description="error"
        @retry="emit('retry')"
      />
      <LoadingSkeleton
        v-else-if="pending"
        variant="card"
        :rows="3"
      />
      <div
        v-else
        class="novel-grid"
      >
        <NovelCard
          v-for="novel in featured"
          :key="novel.id"
          :novel="novel"
        />
      </div>
    </div>
  </section>
  <section class="home-section home-section--surface">
    <div class="site-container">
      <div class="home-section__heading">
        <div><h2>最近更新</h2><p>刚刚长出新枝叶的故事。</p></div><NuxtLink
          to="/novels?sort=updated"
          class="home-section__link"
        >更多更新 →</NuxtLink>
      </div>
      <ErrorState
        v-if="error"
        :description="error"
        @retry="emit('retry')"
      />
      <LoadingSkeleton
        v-else-if="pending"
        variant="list"
        :rows="4"
      />
      <div
        v-else
        class="update-list"
      >
        <NovelCompactItem
          v-for="novel in recent"
          :key="novel.id"
          :novel="novel"
        />
      </div>
    </div>
  </section>
  <section class="home-section">
    <div class="site-container">
      <div class="home-section__heading">
        <div><h2>新作发现</h2><p>还在悄悄成长的小作品，或许会成为你的下一个心头好。</p></div>
      </div>
      <div
        v-if="debut.length"
        class="novel-grid"
      >
        <NovelCard
          v-for="novel in debut"
          :key="novel.id"
          :novel="novel"
        />
      </div>
      <EmptyState
        v-else
        icon="i-lucide-sparkles"
        title="还在等待第一篇新作"
        description="新的故事正在路上，过几天再来看看吧。"
      />
    </div>
  </section>
  <section class="home-section home-section--surface">
    <div class="site-container">
      <div class="home-section__heading">
        <div><h2>按分类散步</h2><p>从熟悉的题材出发，遇见意料之外的故事。</p></div>
      </div>
      <div class="category-list">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="{ path: '/novels', query: { category: category.slug } }"
        ><UIcon :name="category.icon || 'i-lucide-bookmark'" />{{ category.name }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-section{padding:3.5rem 0}.home-section--surface{background:var(--site-surface)}.home-section__heading{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-bottom:1.5rem}.home-section__heading h2{font-size:1.35rem;font-weight:600}.home-section__heading p,.home-section__link{color:var(--site-muted);font-size:.78rem}.novel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.update-list{display:grid}.category-list{display:flex;flex-wrap:wrap;gap:.7rem}.category-list a{display:flex;align-items:center;gap:.4rem;padding:.65rem .85rem;border:1px solid var(--site-line);border-radius:.6rem}@media(max-width:800px){.novel-grid{grid-template-columns:1fr}.home-section{padding:2.5rem 0}}
</style>

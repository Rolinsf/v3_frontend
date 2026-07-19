<script setup lang="ts">
useSeoMeta({
  title: '若林轻小说｜让故事安静生长',
  description: '发现值得慢慢读完的轻小说，也把你心里的故事写下来。'
})

const { data: novels, pending: novelsPending, error: novelsError, refresh: refreshNovels } = useNovelList()
const { data: featured } = useFeaturedNovel()
const { data: categories } = useCategoryTree()
const { progressList } = useReadingProgress()

const featuredNovels = computed(() => novels.value?.slice(0, 3) ?? [])
const recentNovels = computed(() => novels.value ?? [])
// 新作发现：连载中且字数 < 10 万，按更新时间倒序取前 3。
const debutNovels = computed(() => {
  const list = novels.value?.filter(n => n.status === 'serializing' && n.wordCount < 100000) ?? []
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
})

// 继续阅读：取最近一次阅读进度；仅客户端渲染，避免 SSR/CSR 状态错位。
const continueProgress = computed(() => progressList.value[0])
const continueNovel = computed(() => novels.value?.find(n => n.id === continueProgress.value?.novelId))

function formatReadAt(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div>
    <section class="home-hero">
      <div class="site-container home-hero__inner">
        <div>
          <p class="home-hero__eyebrow">
            WAKABAYASHI LIGHT NOVELS
          </p>
          <h1>让每一个故事，安静地生长。</h1>
          <p class="home-hero__lead">
            挑一本喜欢的轻小说，慢慢读；或者坐下来，写下属于你的世界。
          </p>
          <div class="home-hero__actions">
            <UButton
              to="/novels"
              label="去书库看看"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            />
            <UButton
              to="/creator"
              label="开始创作"
              size="lg"
              color="neutral"
              variant="outline"
              icon="i-lucide-pen-line"
            />
          </div>
        </div>
        <NuxtLink
          v-if="featured"
          :to="`/novels/${featured.id}`"
          class="featured-note"
        >
          <NovelNovelCover
            :title="featured.title"
            :tone="featured.coverTone"
          />
          <div>
            <p class="featured-note__label">
              本周编辑推荐
            </p>
            <h2>{{ featured.title }}</h2>
            <p>{{ featured.synopsis }}</p>
            <span>开始阅读 <UIcon name="i-lucide-arrow-right" /></span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <ClientOnly>
      <section
        v-if="continueProgress && continueNovel"
        class="home-section home-section--surface"
      >
        <div class="site-container">
          <div class="home-continue">
            <UIcon
              name="i-lucide-bookmark"
              class="home-continue__icon"
              aria-hidden="true"
            />
            <div class="home-continue__body">
              <p class="home-continue__label">
                继续阅读
              </p>
              <h3>{{ continueNovel.title }}</h3>
              <p>{{ formatReadAt(continueProgress.readAt) }} 读到此处</p>
            </div>
            <UButton
              :to="`/novels/${continueProgress.novelId}/chapters/${continueProgress.chapterId}`"
              label="继续"
              trailing-icon="i-lucide-arrow-right"
            />
          </div>
        </div>
      </section>
    </ClientOnly>

    <section class="home-section">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>编辑推荐</h2>
            <p>一些值得慢慢读下去的故事。</p>
          </div>
          <NuxtLink
            to="/novels"
            class="home-section__link"
          >查看全部 →</NuxtLink>
        </div>
        <ErrorState
          v-if="novelsError"
          :description="novelsError.statusMessage || '无法加载小说列表，请稍后重试。'"
          @retry="refreshNovels()"
        />
        <LoadingSkeleton
          v-else-if="novelsPending"
          variant="card"
          :rows="3"
        />
        <div
          v-else
          class="novel-grid"
        >
          <NovelNovelCard
            v-for="novel in featuredNovels"
            :key="novel.id"
            :novel="novel"
          />
        </div>
      </div>
    </section>

    <section class="home-section home-section--surface">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>最近更新</h2>
            <p>刚刚长出新枝叶的故事。</p>
          </div>
          <NuxtLink
            to="/novels?sort=updated"
            class="home-section__link"
          >更多更新 →</NuxtLink>
        </div>
        <ErrorState
          v-if="novelsError"
          :description="novelsError.statusMessage || '无法加载最近更新，请稍后重试。'"
          @retry="refreshNovels()"
        />
        <LoadingSkeleton
          v-else-if="novelsPending"
          variant="list"
          :rows="4"
        />
        <div
          v-else
          class="update-list"
        >
          <NovelNovelCompactItem
            v-for="novel in recentNovels"
            :key="novel.id"
            :novel="novel"
          />
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>新作发现</h2>
            <p>还在悄悄成长的小作品，或许会成为你的下一个心头好。</p>
          </div>
        </div>
        <div
          v-if="debutNovels.length"
          class="novel-grid"
        >
          <NovelNovelCard
            v-for="novel in debutNovels"
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
          <div>
            <h2>按分类散步</h2>
            <p>从熟悉的题材出发，遇见意料之外的故事。</p>
          </div>
        </div>
        <div class="category-list">
          <NuxtLink
            v-for="category in categories ?? []"
            :key="category.id"
            :to="{ path: '/novels', query: { category: category.slug } }"
          >
            <UIcon :name="category.icon || 'i-lucide-bookmark'" />{{ category.name }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-continue {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-brand-200);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--site-surface) 92%, transparent);
}
.home-continue__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-brand-600);
}
.home-continue__label {
  color: var(--color-brand-700);
  font-size: .75rem;
  letter-spacing: .12em;
}
.home-continue__body h3 {
  margin: .35rem 0 .25rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.home-continue__body p {
  margin: 0;
  color: var(--site-muted);
  font-size: .8rem;
}
@media (max-width: 639px) {
  .home-continue {
    grid-template-columns: auto 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  .home-continue__body p {
    display: none;
  }
}
</style>

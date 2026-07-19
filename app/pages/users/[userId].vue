<script setup lang="ts">
const route = useRoute()
const userId = computed(() => String(route.params.userId))
const { data: user, error, refresh } = usePublicUser(userId)
const { data: novels, pending: novelsPending } = useNovelList()

const works = computed(() => novels.value?.filter(novel => novel.author.id === userId.value) ?? [])
const joinedLabel = computed(() => user.value
  ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(new Date(user.value.joinedAt))
  : '')

useSeoMeta({
  title: () => user.value ? `${user.value.name}｜若林轻小说` : '作者主页｜若林轻小说',
  description: () => user.value?.bio ?? '查看作者公开资料与作品。'
})
</script>

<template>
  <main class="profile-page">
    <div class="site-container profile-shell">
      <ErrorState
        v-if="error"
        :description="error.statusMessage || '无法加载用户资料。'"
        @retry="refresh()"
      />
      <template v-else-if="user">
        <section class="profile-hero">
          <div
            class="profile-avatar"
            aria-hidden="true"
          >
            {{ user.name.slice(0, 1) }}
          </div>
          <div>
            <p class="profile-hero__role">
              AUTHOR
            </p>
            <h1>{{ user.name }}</h1>
            <p class="profile-hero__bio">
              {{ user.bio || '这位作者还没有写下简介。' }}
            </p>
            <p class="profile-hero__joined">
              <UIcon name="i-lucide-calendar-days" />{{ joinedLabel }} 加入若林
            </p>
          </div>
        </section>

        <section class="profile-works">
          <header>
            <div><p>PUBLICATIONS</p><h2>公开作品</h2></div>
            <span>{{ works.length }} 部</span>
          </header>
          <LoadingSkeleton v-if="novelsPending" />
          <EmptyState
            v-else-if="works.length === 0"
            icon="i-lucide-notebook-pen"
            title="暂无公开作品"
            description="作者发布作品后会展示在这里。"
          />
          <div
            v-else
            class="profile-work-grid"
          >
            <NovelNovelCard
              v-for="novel in works"
              :key="novel.id"
              :novel="novel"
            />
          </div>
        </section>

        <aside class="profile-privacy">
          <UIcon name="i-lucide-shield-check" />
          <p>此页面只展示用户主动公开的资料与作品，不公开联系方式、收藏或阅读历史。</p>
        </aside>
      </template>
    </div>
  </main>
</template>

<style scoped>
.profile-page { padding: 3rem 0 5rem; }.profile-shell { max-width: 980px; }
.profile-hero { display: grid; grid-template-columns: 7rem minmax(0, 1fr); gap: 2rem; align-items: center; padding: 2.25rem; border: 1px solid var(--site-line); border-radius: 1rem; background: var(--site-surface); }.profile-avatar { display: grid; place-items: center; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, var(--color-brand-200) 65%, var(--site-paper)); color: var(--color-brand-800); font-family: var(--font-reading); font-size: 2.25rem; }.profile-hero__role, .profile-works header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .16em; }.profile-hero h1 { margin-top: .25rem; font-family: var(--font-reading); font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 600; }.profile-hero__bio { max-width: 38rem; margin-top: .65rem; color: var(--site-muted); font-size: .88rem; line-height: 1.8; }.profile-hero__joined { display: flex; align-items: center; gap: .35rem; margin-top: .8rem; color: var(--site-muted); font-size: .7rem; }
.profile-works { margin-top: 3rem; }.profile-works > header { display: flex; align-items: end; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: .8rem; border-bottom: 1px solid var(--site-line); }.profile-works h2 { margin-top: .25rem; font-size: 1.25rem; font-weight: 600; }.profile-works header > span { color: var(--site-muted); font-size: .75rem; }.profile-work-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.profile-privacy { display: flex; gap: .65rem; margin-top: 3rem; padding: 1rem; border: 1px dashed var(--site-line); border-radius: .75rem; color: var(--site-muted); font-size: .75rem; }.profile-privacy > svg { flex: none; color: var(--color-brand-600); }
@media (max-width: 700px) { .profile-page { padding-top: 1.5rem; }.profile-hero { grid-template-columns: 4.5rem minmax(0, 1fr); gap: 1rem; padding: 1.25rem; }.profile-avatar { font-size: 1.5rem; }.profile-work-grid { grid-template-columns: 1fr; } }
</style>

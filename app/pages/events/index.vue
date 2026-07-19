<script setup lang="ts">
useSeoMeta({ title: '活动中心｜若林轻小说', description: '参加每月主题创作、官方活动和读者发起的社区活动。' })
const auth = useAuthStore()
const admin = useAdmin()
const source = ref<'all' | 'official' | 'community'>('all')
const sort = ref<'latest' | 'popular' | 'submissions'>('latest')
const direction = ref<'desc' | 'asc'>('desc')
const sourceOptions = [{ value: 'all', label: '全部活动' }, { value: 'official', label: '官方企划' }, { value: 'community', label: '社区发起' }] as const
const eventSortOptions = [{ value: 'latest', label: '最新活动' }, { value: 'popular', label: '热门优先' }, { value: 'submissions', label: '投稿最多' }] as const
const activities = computed(() => {
  const list = admin.data.value.activities.filter(item => item.enabled && (source.value === 'all' || (source.value === 'official' ? item.kind !== 'community' : item.kind === 'community')))
  const factor = direction.value === 'desc' ? -1 : 1
  return [...list].sort((a, b) => {
    if (sort.value === 'popular') return (a.likeCount - b.likeCount) * factor
    if (sort.value === 'submissions') return (a.submissionCount - b.submissionCount) * factor
    return a.startAt.localeCompare(b.startAt) * factor
  })
})
const kindLabel = { monthly: '每月活动', official: '官方活动', community: '社区活动' }

function createActivity() {
  if (auth.isLoggedIn) return navigateTo('/events/new')
  auth.saveIntent({ redirect: '/events/new', action: 'create-activity' })
  return navigateTo({ path: '/login', query: { redirect: '/events/new' } })
}

function submit(id: string) {
  const target = `/events/${id}/submit`
  if (auth.isLoggedIn) return navigateTo(target)
  auth.saveIntent({ redirect: target, action: 'submit-activity', targetId: id })
  return navigateTo({ path: '/login', query: { redirect: target } })
}

function like(id: string) {
  if (!auth.isLoggedIn) {
    auth.saveIntent({ redirect: '/events', action: 'like-activity', targetId: id })
    return navigateTo({ path: '/login', query: { redirect: '/events' } })
  }
  admin.likeActivity(id)
}
</script>

<template>
  <main class="events-page">
    <div class="site-container">
      <header class="events-hero">
        <div><p>COMMUNITY EVENTS</p><h1>活动中心</h1><span>若林官方企划与社区创作活动的集中地。</span></div>
        <UButton
          label="创建活动"
          icon="i-lucide-plus"
          @click="createActivity"
        />
      </header>
      <section
        class="event-filters"
        aria-label="活动筛选"
      >
        <div>
          <span>活动来源</span><button
            v-for="option in sourceOptions"
            :key="option.value"
            :class="{ active: source===option.value }"
            @click="source=option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <div>
          <span>排列方式</span><button
            v-for="option in eventSortOptions"
            :key="option.value"
            :class="{ active: sort===option.value }"
            @click="sort=option.value"
          >
            {{ option.label }}
          </button><button @click="direction=direction==='desc'?'asc':'desc'">
            <UIcon :name="direction==='desc'?'i-lucide-arrow-down':'i-lucide-arrow-up'" />{{ direction==='desc'?'倒序':'正序' }}
          </button>
        </div>
      </section>
      <div class="event-list">
        <article
          v-for="activity in activities"
          :key="activity.id"
          class="event-card"
        >
          <div class="event-card__body">
            <div class="event-card__meta">
              <span>{{ kindLabel[activity.kind] }}</span><time>{{ activity.startAt }} — {{ activity.endAt }}</time>
            </div>
            <h2>{{ activity.title }}</h2>
            <p class="event-card__theme">
              主题：{{ activity.theme }}
            </p>
            <p>{{ activity.summary }}</p>
            <small v-if="activity.creatorName">发起人：{{ activity.creatorName }}</small>
          </div>
          <div class="event-card__actions">
            <div class="event-card__stats">
              <span><UIcon name="i-lucide-eye" />{{ activity.viewCount }}</span><button @click="like(activity.id)">
                <UIcon name="i-lucide-heart" />{{ activity.likeCount }}
              </button><NuxtLink :to="`/events/${activity.id}/submissions#comments`"><UIcon name="i-lucide-message-circle" />评论</NuxtLink><strong>{{ activity.submissionCount }} 篇投稿</strong>
            </div>
            <UButton
              label="投稿"
              icon="i-lucide-send"
              @click="submit(activity.id)"
            />
            <UButton
              :to="`/events/${activity.id}/submissions`"
              label="查看投稿"
              color="neutral"
              variant="outline"
            />
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.events-page { padding: 2.5rem 0 5rem; }.events-hero { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; }.events-hero p { color: var(--color-brand-700); font-size: .7rem; letter-spacing: .15em; }.events-hero h1 { margin: .35rem 0; font-family: var(--font-reading); font-size: 2.2rem; }.events-hero span { color: var(--site-muted); }.event-filters{display:grid;gap:.7rem;margin-bottom:1.25rem;padding:1rem 1.25rem;border:1px solid var(--site-line);border-radius:.8rem;background:var(--site-surface)}.event-filters>div{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem}.event-filters span{min-width:5rem;color:var(--site-muted);font-size:.75rem}.event-filters button{display:inline-flex;align-items:center;gap:.25rem;padding:.35rem .7rem;border-radius:999px;font-size:.78rem}.event-filters button.active{background:var(--color-brand-100);color:var(--color-brand-800);font-weight:600}.event-list { display: grid; gap: 1rem; }.event-card { display: grid; grid-template-columns: 1fr auto; gap: 2rem; padding: 1.5rem; border: 1px solid var(--site-line); border-radius: 1rem; background: var(--site-surface); }.event-card__meta { display: flex; gap: 1rem; color: var(--site-muted); font-size: .72rem; }.event-card__meta span { color: var(--color-brand-700); }.event-card h2 { margin: .7rem 0; font-size: 1.25rem; font-weight: 600; }.event-card p { color: var(--site-muted); line-height: 1.8; }.event-card__theme { color: var(--site-ink) !important; }.event-card small { color: var(--site-muted); }.event-card__actions { display: flex; align-items: center; gap: .5rem; }.event-card__stats{display:flex;align-items:center;gap:.7rem;margin-right:.5rem;color:var(--site-muted);font-size:.72rem}.event-card__stats span,.event-card__stats button,.event-card__stats a{display:inline-flex;align-items:center;gap:.2rem}.event-card__actions strong { color: var(--site-muted); font-size: .75rem; }@media(max-width:760px){.events-hero,.event-card{grid-template-columns:1fr;align-items:start;flex-direction:column}.event-card__actions{flex-wrap:wrap}.event-card__stats{width:100%;flex-wrap:wrap}}
</style>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '我的｜若林轻小说', description: '统一管理个人资料、作品、评论和阅读数据。' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const creator = useCreatorStore()
const commentsStore = useCommentsStore()
const bookshelf = useBookshelfStore()
const section = computed(() => typeof route.query.section === 'string' ? route.query.section : 'overview')
const name = ref(auth.user?.name ?? '')
const avatarUrl = ref(auth.user?.avatarUrl ?? '')
const saved = ref(false)
const ownedNovels = creator.ownedNovels(auth.user?.id ?? '')
const myComments = commentsStore.myEntries(auth.user?.id ?? '')
const contributions = computed(() => {
  const days = new Map<string, number>()
  for (const novel of ownedNovels.value) {
    const dates = [novel.createdAt, novel.updatedAt]
    for (const volume of novel.volumes) {
      for (const chapter of volume.chapters) {
        if (chapter.status === 'published' && chapter.publishedAt) dates.push(chapter.publishedAt)
      }
    }
    for (const value of dates) {
      const date = value.slice(0, 10)
      days.set(date, (days.get(date) ?? 0) + 1)
    }
  }
  return [...days].map(([date, count]) => ({ date, count }))
})

const navigation = [
  { id: 'overview', label: '账户概览', icon: 'i-lucide-layout-dashboard' },
  { id: 'profile', label: '个人信息', icon: 'i-lucide-user-round' },
  { id: 'works', label: '我的作品', icon: 'i-lucide-book-open' },
  { id: 'comments', label: '我的评论', icon: 'i-lucide-message-circle' },
  { id: 'reading', label: '阅读管理', icon: 'i-lucide-bookmark' },
  { id: 'notifications', label: '通知中心', icon: 'i-lucide-bell' },
  { id: 'security', label: '账户安全', icon: 'i-lucide-shield-check' }
]

function selectSection(id: string) {
  router.replace({ query: id === 'overview' ? {} : { section: id } })
}

function saveProfile() {
  auth.updateProfile({ name: name.value, avatarUrl: avatarUrl.value })
  saved.value = true
  setTimeout(() => { saved.value = false }, 1800)
}
</script>

<template>
  <main class="account-page">
    <div class="site-container account-layout">
      <aside class="account-sidebar">
        <div class="account-identity">
          <span class="account-avatar">{{ auth.user?.name.slice(0, 1) }}</span>
          <div><strong>{{ auth.user?.name }}</strong><small>{{ auth.user?.role === 'admin' ? '管理员' : '若林用户' }}</small></div>
        </div>
        <nav aria-label="我的功能">
          <button
            v-for="item in navigation"
            :key="item.id"
            :class="{ active: section === item.id }"
            @click="selectSection(item.id)"
          >
            <UIcon :name="item.icon" />{{ item.label }}
          </button>
        </nav>
      </aside>

      <section class="account-content">
        <template v-if="section === 'overview'">
          <header><p>MY ACCOUNT</p><h1>我的</h1><span>集中管理你的创作、互动与阅读记录。</span></header>
          <UserContributionCalendar
            :contributions="contributions"
            title="创作贡献"
          />
          <div class="account-stats">
            <article><strong>{{ ownedNovels.length }}</strong><span>我的作品</span></article><article><strong>{{ myComments.length }}</strong><span>评论与回复</span></article><article><strong>{{ bookshelf.items.length }}</strong><span>书架收藏</span></article><article><strong>{{ commentsStore.notifications.length }}</strong><span>通知消息</span></article>
          </div>
          <div class="account-shortcuts">
            <button @click="selectSection('profile')">
              <UIcon name="i-lucide-user-round" /><span>完善个人信息</span>
            </button><NuxtLink to="/creator"><UIcon name="i-lucide-pen-line" /><span>进入创作中心</span></NuxtLink><NuxtLink to="/events/new"><UIcon name="i-lucide-calendar-plus" /><span>发起社区活动</span></NuxtLink>
          </div>
        </template>

        <template v-else-if="section === 'profile'">
          <header><h1>个人信息</h1><span>修改公开昵称和头像地址。</span></header><form
            class="profile-form"
            @submit.prevent="saveProfile"
          >
            <label>昵称<UInput v-model="name" /></label><label>头像地址<UInput
              v-model="avatarUrl"
              placeholder="https://…"
            /></label><div>
              <UButton
                type="submit"
                label="保存修改"
              /><span v-if="saved">已保存</span>
            </div>
          </form>
        </template>

        <template v-else-if="section === 'works'">
          <header><h1>我的作品</h1><span>管理小说资料、卷章和草稿。</span></header><div class="section-actions">
            <UButton
              to="/creator/novels/new"
              label="创建作品"
              icon="i-lucide-plus"
            /><UButton
              to="/creator"
              label="完整创作中心"
              color="neutral"
              variant="outline"
            />
          </div><div
            v-if="ownedNovels.length"
            class="work-list"
          >
            <article
              v-for="novel in ownedNovels"
              :key="novel.id"
            >
              <div><strong>{{ novel.title }}</strong><span>{{ novel.status }} · {{ novel.updatedAt.slice(0, 10) }}</span></div><UButton
                :to="`/creator/novels/${novel.id}/edit`"
                label="管理"
                size="sm"
                variant="outline"
              />
            </article>
          </div><EmptyState
            v-else
            icon="i-lucide-book-plus"
            title="还没有作品"
            description="从一个名字开始，写下你的第一部小说。"
          />
        </template>

        <template v-else-if="section === 'comments'">
          <header><h1>我的评论</h1><span>查看和管理你发表的评论与回复。</span></header><p class="section-summary">
            共 {{ myComments.length }} 条互动记录。
          </p><UButton
            to="/account/comments"
            label="进入评论管理"
            trailing-icon="i-lucide-arrow-right"
          />
        </template>

        <template v-else-if="section === 'reading'">
          <header><h1>阅读管理</h1><span>统一管理收藏与阅读足迹。</span></header><div class="account-shortcuts">
            <NuxtLink to="/bookshelf"><UIcon name="i-lucide-bookmark" /><span>我的书架</span></NuxtLink><NuxtLink to="/history"><UIcon name="i-lucide-history" /><span>阅读历史</span></NuxtLink>
          </div>
        </template>

        <template v-else-if="section === 'notifications'">
          <header><h1>通知中心</h1><span>查看回复、点赞、作品更新和系统通知。</span></header><p class="section-summary">
            当前有 {{ commentsStore.unreadCount }} 条未读通知。
          </p><UButton
            to="/notifications"
            label="查看全部通知"
          />
        </template>

        <template v-else>
          <header><h1>账户安全</h1><span>管理登录状态和账户安全。</span></header><div class="security-card">
            <UIcon name="i-lucide-shield-check" /><div><strong>当前账户已登录</strong><p>{{ auth.user?.identifier }}</p></div>
          </div><p class="section-summary">
            当前为前端 Mock 认证阶段；正式后端接入后将在这里提供密码修改、登录设备和会话管理。
          </p>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.account-page{padding:2rem 0 5rem}.account-layout{display:grid;grid-template-columns:14rem minmax(0,1fr);gap:2rem;align-items:start}.account-sidebar{position:sticky;top:calc(var(--site-header-height) + 1rem);padding:1rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-identity{display:flex;align-items:center;gap:.7rem;padding:.4rem .35rem 1rem;border-bottom:1px solid var(--site-line)}.account-avatar{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-100);color:var(--color-brand-800);font-weight:600}.account-identity strong,.account-identity small{display:block}.account-identity small{margin-top:.15rem;color:var(--site-muted);font-size:.68rem}.account-sidebar nav{display:grid;gap:.2rem;margin-top:.75rem}.account-sidebar button{display:flex;align-items:center;gap:.6rem;width:100%;padding:.6rem .7rem;border-radius:.5rem;color:var(--site-muted);font-size:.82rem;text-align:left}.account-sidebar button:hover,.account-sidebar button.active{background:var(--color-brand-50);color:var(--color-brand-800)}.account-content{min-height:32rem;padding:1.5rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-content header{padding-bottom:1rem;border-bottom:1px solid var(--site-line)}.account-content header>p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.account-content h1{margin:.25rem 0;font-family:var(--font-reading);font-size:2rem;font-weight:600}.account-content header>span,.section-summary{color:var(--site-muted);font-size:.78rem}.account-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-top:1.25rem}.account-stats article{padding:1rem;border:1px solid var(--site-line);border-radius:.65rem}.account-stats strong,.account-stats span{display:block}.account-stats strong{font-size:1.5rem}.account-stats span{margin-top:.25rem;color:var(--site-muted);font-size:.72rem}.account-shortcuts{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1.25rem}.account-shortcuts a,.account-shortcuts button{display:flex;align-items:center;gap:.6rem;padding:1rem;border:1px solid var(--site-line);border-radius:.65rem;color:inherit}.profile-form{display:grid;gap:1rem;max-width:34rem;margin-top:1.25rem}.profile-form label{display:grid;gap:.4rem;font-size:.78rem}.profile-form>div{display:flex;align-items:center;gap:.7rem}.profile-form>div span{color:var(--color-brand-700);font-size:.72rem}.section-actions{display:flex;gap:.5rem;margin:1.25rem 0}.work-list{display:grid}.work-list article{display:flex;align-items:center;justify-content:space-between;padding:.9rem 0;border-bottom:1px solid var(--site-line)}.work-list article span{display:block;margin-top:.2rem;color:var(--site-muted);font-size:.7rem}.section-summary{margin:1.25rem 0}.security-card{display:flex;align-items:center;gap:1rem;margin-top:1.25rem;padding:1rem;border:1px solid var(--color-brand-200);border-radius:.65rem;background:var(--color-brand-50)}.security-card>svg{font-size:1.5rem;color:var(--color-brand-700)}.security-card p{color:var(--site-muted);font-size:.72rem}@media(max-width:800px){.account-layout{grid-template-columns:1fr}.account-sidebar{position:static;overflow-x:auto}.account-identity{display:none}.account-sidebar nav{display:flex;margin:0}.account-sidebar button{width:auto;white-space:nowrap}.account-stats{grid-template-columns:repeat(2,1fr)}.account-shortcuts{grid-template-columns:1fr}}
</style>

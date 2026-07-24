<script setup lang="ts">
const SECTIONS = ['overview', 'profile', 'works', 'comments', 'reading', 'notifications', 'settings', 'security'] as const
type AccountSection = typeof SECTIONS[number]

definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '我的｜若林轻小说', description: '统一管理个人资料、作品、评论和阅读数据。' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const requestedSection = computed(() => typeof route.query.section === 'string' ? route.query.section : 'overview')
const section = computed<AccountSection>(() => SECTIONS.includes(requestedSection.value as AccountSection) ? requestedSection.value as AccountSection : 'overview')
const readingView = computed<'bookshelf' | 'history'>(() => route.query.view === 'history' ? 'history' : 'bookshelf')
const name = ref(auth.user?.name ?? '')
const avatarUrl = ref(auth.user?.avatarUrl ?? '')
const saved = ref(false)

const navigation = [
  { id: 'overview', label: '账户概览', icon: 'i-lucide-layout-dashboard' },
  { id: 'profile', label: '个人信息', icon: 'i-lucide-user-round' },
  { id: 'works', label: '我的作品', icon: 'i-lucide-book-open' },
  { id: 'comments', label: '我的评论', icon: 'i-lucide-message-circle' },
  { id: 'reading', label: '阅读管理', icon: 'i-lucide-bookmark' },
  { id: 'notifications', label: '通知中心', icon: 'i-lucide-bell' },
  { id: 'settings', label: '偏好与隐私', icon: 'i-lucide-sliders-horizontal' },
  { id: 'security', label: '账户安全', icon: 'i-lucide-shield-check' }
] as const

watch(requestedSection, (value) => {
  if (!SECTIONS.includes(value as AccountSection)) router.replace({ query: {} })
}, { immediate: true })

function selectSection(value: string) {
  router.replace({ query: value === 'overview' ? {} : { section: value } })
}
function selectReadingView(view: 'bookshelf' | 'history') {
  router.replace({ query: { section: 'reading', ...(view === 'history' ? { view } : {}) } })
}
function saveProfile() {
  auth.updateProfile({ name: name.value, avatarUrl: avatarUrl.value })
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 1800)
}
</script>

<template>
  <main class="account-page">
    <div class="site-container account-layout">
      <aside class="account-sidebar">
        <div class="account-identity">
          <span class="account-avatar">{{ auth.user?.name.slice(0, 1) }}</span><div><strong>{{ auth.user?.name }}</strong><small>{{ auth.user?.role === 'admin' ? '管理员' : '若林用户' }}</small></div>
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
        <AccountOverview
          v-if="section === 'overview'"
          @select="selectSection"
        />
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
        <AccountWorks v-else-if="section === 'works'" />
        <AccountComments v-else-if="section === 'comments'" />
        <AccountReading
          v-else-if="section === 'reading'"
          :view="readingView"
          @view="selectReadingView"
        />
        <AccountNotifications v-else-if="section === 'notifications'" />
        <AccountSettings v-else-if="section === 'settings'" />
        <template v-else>
          <header><h1>账户安全</h1><span>管理登录状态和账户安全。</span></header><div class="security-card">
            <UIcon name="i-lucide-shield-check" /><div><strong>当前账户已登录</strong><p>{{ auth.user?.identifier }}</p></div>
          </div><p class="section-summary">
            当前为前端 Mock 认证阶段；正式认证接入前，服务端必须配置 NUXT_SESSION_SECRET。
          </p>
        </template>
      </section>
    </div>
  </main>
</template>

<style>
.account-page{padding:2rem 0 5rem}.account-layout{display:grid;grid-template-columns:14rem minmax(0,1fr);gap:2rem;align-items:start}.account-sidebar{position:sticky;top:calc(var(--site-header-height) + 1rem);padding:1rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-identity{display:flex;align-items:center;gap:.7rem;padding:.4rem .35rem 1rem;border-bottom:1px solid var(--site-line)}.account-avatar{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-100);color:var(--color-brand-800);font-weight:600}.account-identity strong,.account-identity small{display:block}.account-identity small{color:var(--site-muted);font-size:.68rem}.account-sidebar nav{display:grid;gap:.2rem;margin-top:.75rem}.account-sidebar button{display:flex;align-items:center;gap:.6rem;width:100%;padding:.6rem .7rem;border-radius:.5rem;color:var(--site-muted);font-size:.82rem}.account-sidebar button:hover,.account-sidebar button.active{background:var(--color-brand-50);color:var(--color-brand-800)}.account-content{min-height:32rem;padding:1.5rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-content header{padding-bottom:1rem;border-bottom:1px solid var(--site-line)}.account-content header>p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.account-content h1{margin:.25rem 0;font-family:var(--font-reading);font-size:2rem;font-weight:600}.account-content header span,.section-summary{color:var(--site-muted);font-size:.78rem}.account-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-top:1.25rem}.account-stats article,.account-shortcuts>*{padding:1rem;border:1px solid var(--site-line);border-radius:.65rem}.account-stats strong,.account-stats span{display:block}.account-stats strong{font-size:1.5rem}.account-stats span,.work-info span,.notification-list p,.notification-list time{color:var(--site-muted);font-size:.72rem}.account-shortcuts{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1.25rem}.account-shortcuts>*{display:flex;align-items:center;gap:.6rem;color:inherit}.profile-form{display:grid;gap:1rem;max-width:34rem;margin-top:1.25rem}.profile-form label{display:grid;gap:.4rem;font-size:.78rem}.profile-form>div,.section-actions,.item-actions,.work-actions{display:flex;align-items:center;gap:.5rem}.section-actions{margin:1.25rem 0}.work-list article,.reading-list article{display:grid;grid-template-columns:3.5rem minmax(0,1fr) auto;gap:.8rem;align-items:center;padding:.9rem 0;border-bottom:1px solid var(--site-line)}.work-cover{display:grid;place-items:center;aspect-ratio:3/4;overflow:hidden;border-radius:.4rem;background:var(--color-brand-100)}.work-cover img{width:100%;height:100%;object-fit:cover}.activity-list article{padding:1.1rem 0;border-bottom:1px solid var(--site-line)}.activity-list article>p{margin:.55rem 0 .8rem;line-height:1.7}.item-meta{display:flex;gap:.6rem;color:var(--site-muted);font-size:.68rem}.subsection-tabs,.filter-tabs{display:flex;gap:1.2rem;border-bottom:1px solid var(--site-line)}.subsection-tabs{margin-top:1.2rem}.subsection-tabs button,.filter-tabs button{padding:.7rem .1rem;border-bottom:2px solid transparent;color:var(--site-muted)}.subsection-tabs button.active,.filter-tabs button.active{border-color:var(--color-brand-600);color:var(--site-ink)}.filter-tabs{margin:1rem 0}.reading-list .novel-cover{width:3.5rem}.reading-list article>div:nth-child(2) span{display:block;color:var(--site-muted);font-size:.7rem}.history-icon,.notification-icon{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-50);color:var(--color-brand-700)}.section-heading{display:flex;justify-content:space-between}.notification-list>a{display:grid;grid-template-columns:2.5rem minmax(0,1fr) auto;gap:.8rem;padding:1rem 0;border-bottom:1px solid var(--site-line)}.security-card{display:flex;align-items:center;gap:1rem;margin-top:1.25rem;padding:1rem;border:1px solid var(--color-brand-200);border-radius:.65rem;background:var(--color-brand-50)}@media(max-width:800px){.account-layout{grid-template-columns:1fr}.account-sidebar{position:static;overflow-x:auto}.account-identity{display:none}.account-sidebar nav{display:flex;margin:0}.account-sidebar button{width:auto;white-space:nowrap}.account-stats{grid-template-columns:repeat(2,1fr)}.account-shortcuts{grid-template-columns:1fr}.work-list article,.reading-list article{grid-template-columns:3.5rem minmax(0,1fr)}.work-actions,.reading-list .item-actions{grid-column:2;flex-wrap:wrap}}
</style>

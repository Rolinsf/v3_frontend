<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const admin = useAdmin()
const searchQuery = ref('')
const announcementOpen = ref(false)
const announcements = computed(() => admin.data.value.announcements.filter(item => item.enabled).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)))
const navigation = [
  { label: '首页', to: '/' },
  { label: '书库', to: '/novels' },
  { label: '排行', to: '/rankings' },
  { label: '活动', to: '/events' },
  { label: '我的', to: '/account' }
]

function submitSearch() {
  const q = searchQuery.value.trim()
  if (q) navigateTo({ path: '/search', query: { q } })
}

function handleLogout() {
  auth.logout()
  // 注销后回到当前页，让页面级 middleware 自行处理需要登录的路由
  navigateTo({ path: '/' })
}

function avatarLabel() {
  const name = auth.user?.name
  if (!name) return ''
  return name.slice(0, 1).toUpperCase()
}

// 已登录用户的快捷菜单：s4-4 暂以按钮形式展示，
// s4-5 接入书架后再改为完整的 UDropdownMenu（我的书架/历史/账户/退出）。
</script>

<template>
  <header class="site-header">
    <div class="site-container site-header__inner">
      <NuxtLink
        to="/"
        class="site-header__logo"
      ><AppLogo /></NuxtLink>
      <nav
        class="site-header__nav"
        aria-label="主导航"
      >
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="site-header__nav-link"
          :class="{ 'is-active': route.path === item.to }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      <form
        class="site-header__search"
        role="search"
        @submit.prevent="submitSearch"
      >
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="搜索小说、作者或标签"
          aria-label="搜索小说、作者或标签"
        />
      </form>
      <div class="site-header__actions">
        <UButton
          label="公告"
          icon="i-lucide-megaphone"
          color="neutral"
          variant="ghost"
          class="desktop-action"
          @click="announcementOpen = true"
        />
        <UColorModeButton
          color="neutral"
          variant="ghost"
          aria-label="切换颜色模式"
        />
        <UButton
          to="/search"
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          aria-label="搜索"
          class="mobile-search"
        />
        <!-- 已登录：显示头像与注销；未登录：显示登录按钮。
             使用 ClientOnly 避免 SSR/CSR 注水错位（auth.user 仅在客户端注水）。 -->
        <ClientOnly>
          <div
            v-if="auth.isLoggedIn"
            class="site-header__user"
          >
            <NuxtLink
              to="/account?section=reading"
              class="site-header__user-link"
              :aria-label="`已登录：${auth.user?.name}，进入书架`"
            >
              <span class="site-header__avatar">{{ avatarLabel() }}</span>
              <span class="site-header__user-name">{{ auth.user?.name }}</span>
            </NuxtLink>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-log-out"
              aria-label="退出登录"
              @click="handleLogout"
            />
          </div>
          <UButton
            v-else
            to="/login"
            label="登录"
            color="primary"
            variant="soft"
          />
          <template #fallback>
            <!-- SSR 占位：保持布局稳定，避免登录按钮闪现 -->
            <div class="site-header__user-fallback" />
          </template>
        </ClientOnly>
      </div>
    </div>
    <UModal
      v-model:open="announcementOpen"
      title="网站公告"
      description="若林轻小说的最新通知"
    >
      <template #body>
        <div class="announcement-list">
          <article
            v-for="item in announcements"
            :key="item.id"
          >
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
            <time :datetime="item.publishedAt">{{ item.publishedAt.slice(0, 10) }}</time>
          </article>
          <p v-if="!announcements.length">
            暂时没有公告。
          </p>
        </div>
      </template>
    </UModal>
  </header>
</template>

<style scoped>
.announcement-list { display: grid; gap: 1rem; }
.announcement-list article { padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }
.announcement-list article:last-child { border-bottom: 0; }
.announcement-list h3 { margin: 0 0 .5rem; font-weight: 600; }
.announcement-list p { margin: 0; color: var(--site-muted); line-height: 1.8; white-space: pre-wrap; }
.announcement-list time { display: block; margin-top: .6rem; color: var(--site-muted); font-size: .7rem; }
</style>

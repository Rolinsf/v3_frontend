<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const community = useComments()
const searchQuery = ref('')
const navigation = [
  { label: '首页', to: '/' },
  { label: '书库', to: '/novels' },
  { label: '排行', to: '/rankings' }
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
          to="/creator"
          label="创作中心"
          icon="i-lucide-pen-line"
          color="neutral"
          variant="ghost"
          class="desktop-action"
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
              to="/bookshelf"
              class="site-header__user-link"
              :aria-label="`已登录：${auth.user?.name}，进入书架`"
            >
              <span class="site-header__avatar">{{ avatarLabel() }}</span>
              <span class="site-header__user-name">{{ auth.user?.name }}</span>
            </NuxtLink>
            <UButton
              to="/account/comments"
              color="neutral"
              variant="ghost"
              icon="i-lucide-message-circle"
              aria-label="我的评论"
            />
            <UChip
              :show="community.unreadCount.value > 0"
              color="primary"
              inset
            >
              <UButton
                to="/notifications"
                color="neutral"
                variant="ghost"
                icon="i-lucide-bell"
                aria-label="通知中心"
              />
            </UChip>
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
  </header>
</template>

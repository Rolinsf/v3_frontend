<script setup lang="ts">
// 管理后台布局：左侧侧边导航 + 主区。
// 阶段 1 只建立骨架，具体管理页面在阶段 7 实现；权限由后端校验，前端仅负责体验。
const adminNav = [
  { label: '概览', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: '分类管理', icon: 'i-lucide-folder-tree', to: '/admin/categories' },
  { label: '标签管理', icon: 'i-lucide-tags', to: '/admin/tags' },
  { label: '页脚管理', icon: 'i-lucide-panel-bottom', to: '/admin/footer' },
  { label: '首页标签云', icon: 'i-lucide-cloud', to: '/admin/discovery' },
  { label: '内容审核', icon: 'i-lucide-shield-check', to: '/admin/reviews' },
  { label: '举报处理', icon: 'i-lucide-flag', to: '/admin/reports' },
  { label: '用户封禁', icon: 'i-lucide-user-x', to: '/admin/bans' }
]
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <NuxtLink
        to="/admin"
        class="admin-sidebar__brand"
      >
        <AppLogo size="medium" />
      </NuxtLink>
      <nav aria-label="管理后台导航">
        <NuxtLink
          v-for="item in adminNav"
          :key="item.to"
          :to="item.to"
          class="admin-sidebar__link"
        >
          <UIcon
            :name="item.icon"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 15rem 1fr;
  min-height: 100vh;
}
.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--site-line);
  background: var(--site-surface);
}
.admin-sidebar__brand {
  padding: 0 .5rem;
}
.admin-sidebar__link {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .6rem .75rem;
  border-radius: .5rem;
  color: var(--site-muted);
  font-size: .9rem;
}
.admin-sidebar__link:hover {
  color: var(--color-brand-700);
  background: var(--color-brand-50);
}
.admin-sidebar__link.router-link-active {
  color: var(--color-brand-700);
  background: var(--color-brand-50);
}
.admin-main {
  min-width: 0;
  padding: 2rem 2.5rem;
}
@media (max-width: 900px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  .admin-sidebar {
    overflow-x: auto;
    padding: 1rem;
    border-right: 0;
    border-bottom: 1px solid var(--site-line);
  }
  .admin-sidebar nav {
    display: flex;
    gap: .25rem;
  }
  .admin-sidebar__link {
    white-space: nowrap;
  }
  .admin-main {
    padding: 1.25rem;
  }
}
</style>

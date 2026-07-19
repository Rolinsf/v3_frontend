<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '我的账户｜若林轻小说', description: '管理个人资料、阅读偏好与社区活动。' })

const sections = [
  { label: '我的评论', description: '查看和管理已发表的评论与回复。', icon: 'i-lucide-message-circle', to: '/account/comments' },
  { label: '我的书架', description: '继续阅读并管理收藏的作品。', icon: 'i-lucide-bookmark', to: '/bookshelf' },
  { label: '阅读历史', description: '查看最近读过的章节与进度。', icon: 'i-lucide-history', to: '/history' },
  { label: '通知中心', description: '查看回复、提及与作品更新。', icon: 'i-lucide-bell', to: '/notifications' }
]
</script>

<template>
  <main class="account-page">
    <div class="site-container account-shell">
      <header>
        <p>MY ACCOUNT</p>
        <h1>我的账户</h1>
        <span>管理阅读记录与社区活动。</span>
      </header>
      <nav
        aria-label="账户功能"
        class="account-grid"
      >
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
        >
          <UIcon :name="section.icon" />
          <div><h2>{{ section.label }}</h2><p>{{ section.description }}</p></div>
          <UIcon name="i-lucide-chevron-right" />
        </NuxtLink>
      </nav>
    </div>
  </main>
</template>

<style scoped>
.account-page { padding: 3rem 0 5rem; }.account-shell { max-width: 780px; }.account-shell > header { padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }.account-shell > header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }.account-shell h1 { margin-top: .25rem; font-family: var(--font-reading); font-size: 2.3rem; font-weight: 600; }.account-shell > header span { color: var(--site-muted); font-size: .75rem; }.account-grid { display: grid; gap: .75rem; margin-top: 1.5rem; }.account-grid > a { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; min-height: 88px; padding: 1rem; color: inherit; border: 1px solid var(--site-line); border-radius: 12px; transition: border-color 180ms, transform 180ms; }.account-grid > a:hover { border-color: var(--color-brand-300); transform: translateY(-1px); }.account-grid > a > svg:first-child { color: var(--color-brand-600); font-size: 1.25rem; }.account-grid h2 { font-size: .95rem; font-weight: 600; }.account-grid p { margin-top: .2rem; color: var(--site-muted); font-size: .75rem; }
</style>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '通知中心｜若林轻小说', description: '查看回复、点赞与系统通知。' })
const community = useComments()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
</script>

<template>
  <main class="notification-page">
    <div class="site-container notification-shell">
      <header class="notification-heading">
        <div><p>INBOX</p><h1>通知中心</h1><span>回复、点赞与系统处理结果会出现在这里。</span></div>
        <UButton
          v-if="community.unreadCount.value"
          label="全部标为已读"
          color="neutral"
          variant="ghost"
          @click="community.markAllRead"
        />
      </header>
      <EmptyState
        v-if="community.notifications.value.length === 0"
        icon="i-lucide-bell"
        title="暂时没有通知"
        description="有新的互动时，我们会安静地放在这里。"
      />
      <div
        v-else
        class="notification-list"
      >
        <NuxtLink
          v-for="item in community.notifications.value"
          :key="item.id"
          :to="item.to || '/notifications'"
          class="notification-item"
          :class="{ 'is-unread': !item.read }"
        >
          <span class="notification-item__icon"><UIcon :name="item.type === 'reply' ? 'i-lucide-reply' : item.type === 'like' ? 'i-lucide-heart' : 'i-lucide-shield-check'" /></span>
          <div><strong>{{ item.title }}</strong><p>{{ item.description }}</p><time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time></div>
          <i
            v-if="!item.read"
            aria-label="未读"
          />
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.notification-page { padding: 3rem 0 5rem; }.notification-shell { max-width: 780px; }.notification-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }.notification-heading p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }.notification-heading h1 { margin-top: .25rem; font-family: var(--font-reading); font-size: 2.3rem; font-weight: 600; }.notification-heading span { color: var(--site-muted); font-size: .75rem; }.notification-list { display: grid; }.notification-item { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr) auto; gap: .9rem; padding: 1.2rem 0; border-bottom: 1px solid var(--site-line); }.notification-item__icon { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--site-surface); color: var(--site-muted); }.notification-item.is-unread .notification-item__icon { background: var(--color-brand-100); color: var(--color-brand-700); }.notification-item strong { font-size: .85rem; }.notification-item p { margin-top: .2rem; color: var(--site-muted); font-size: .78rem; }.notification-item time { color: var(--site-muted); font-size: .65rem; }.notification-item > i { width: .45rem; height: .45rem; margin-top: .5rem; border-radius: 50%; background: var(--color-brand-500); }
</style>

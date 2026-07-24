<script setup lang="ts">
const comments = useCommentsStore()
const following = useFollowingStore()
const account = useAccountStore()
const { data: novels } = useNovelList()
const page = ref(1)
const notificationPage = computed(() => comments.notificationPage(page.value, 8).value)
const updates = computed(() => account.preferences.notifications.novelUpdates ? (novels.value ?? []).filter(novel => following.unreadCount(novel.id, novel.updatedAt) > 0) : [])
const visibleNotifications = computed(() => notificationPage.value.items.filter((item) => {
  if (item.type === 'reply') return account.preferences.notifications.replies
  if (item.type === 'mention') return account.preferences.notifications.mentions
  if (item.type === 'like') return account.preferences.notifications.likes
  if (item.type === 'review') return account.preferences.notifications.reviews
  return true
}))
const unreadCount = computed(() => visibleNotifications.value.filter(item => !item.read).length + updates.value.length)
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
</script>

<template>
  <header class="section-heading">
    <div><h1>通知中心</h1><span>回复、点赞、作品更新和系统通知，当前 {{ unreadCount }} 条未读。</span></div><UButton
      v-if="comments.unreadCount"
      label="互动消息全部已读"
      color="neutral"
      variant="ghost"
      @click="comments.markAllRead"
    />
  </header>
  <EmptyState
    v-if="!updates.length && !comments.notifications.length"
    icon="i-lucide-bell"
    title="暂时没有通知"
    description="有新的互动时，我们会安静地放在这里。"
  />
  <div
    v-else
    class="notification-list"
  >
    <NuxtLink
      v-for="novel in updates"
      :key="`update-${novel.id}`"
      :to="`/novels/${novel.id}/chapters/${novel.latestChapter.id}`"
      class="unread"
      @click="following.markUpdateSeen(novel.id, novel.updatedAt)"
    >
      <span class="notification-icon"><UIcon name="i-lucide-book-open-check" /></span>
      <div><strong>{{ novel.title }} 更新了</strong><p>新章节：{{ novel.latestChapter.title }}</p><time>{{ formatDate(novel.updatedAt) }}</time></div><i />
    </NuxtLink>
    <NuxtLink
      v-for="item in visibleNotifications"
      :key="item.id"
      :to="item.to || '/account?section=notifications'"
      :class="{ unread: !item.read }"
      @click="comments.markRead(item.id)"
    >
      <span class="notification-icon"><UIcon :name="item.type === 'reply' ? 'i-lucide-reply' : item.type === 'like' ? 'i-lucide-heart' : 'i-lucide-shield-check'" /></span>
      <div><strong>{{ item.title }}</strong><p>{{ item.description }}</p><time>{{ formatDate(item.createdAt) }}</time></div><i v-if="!item.read" />
    </NuxtLink>
  </div>
  <UPagination
    v-if="notificationPage.pageCount > 1"
    v-model:page="page"
    :total="notificationPage.total"
    :items-per-page="8"
    class="notification-pagination"
  />
</template>

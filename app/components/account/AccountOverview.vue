<script setup lang="ts">
const emit = defineEmits<{ select: [section: string] }>()
const auth = useAuthStore()
const creator = useCreatorStore()
const comments = useCommentsStore()
const bookshelf = useBookshelfStore()
const ownedNovels = creator.ownedNovels(auth.user?.id ?? '')
const contributions = computed(() => {
  const days = new Map<string, number>()
  for (const novel of ownedNovels.value) {
    for (const value of [novel.createdAt, novel.updatedAt, ...novel.volumes.flatMap(volume => volume.chapters.filter(chapter => chapter.status === 'published').map(chapter => chapter.publishedAt ?? ''))]) {
      if (!value) continue
      const date = value.slice(0, 10)
      days.set(date, (days.get(date) ?? 0) + 1)
    }
  }
  return [...days].map(([date, count]) => ({ date, count }))
})
</script>

<template>
  <header><p>MY ACCOUNT</p><h1>我的</h1><span>集中管理你的创作、互动与阅读记录。</span></header>
  <UserContributionCalendar
    :contributions="contributions"
    title="创作贡献"
  />
  <div class="account-stats">
    <article><strong>{{ ownedNovels.length }}</strong><span>我的作品</span></article>
    <article><strong>{{ comments.myEntries(auth.user?.id ?? '').value.length }}</strong><span>评论与回复</span></article>
    <article><strong>{{ bookshelf.items.length }}</strong><span>书架收藏</span></article>
    <article><strong>{{ comments.notifications.length }}</strong><span>通知消息</span></article>
  </div>
  <div class="account-shortcuts">
    <button @click="emit('select', 'profile')">
      <UIcon name="i-lucide-user-round" />完善个人信息
    </button>
    <button @click="emit('select', 'works')">
      <UIcon name="i-lucide-pen-line" />管理我的创作
    </button>
    <NuxtLink to="/events/new"><UIcon name="i-lucide-calendar-plus" />发起社区活动</NuxtLink>
  </div>
</template>

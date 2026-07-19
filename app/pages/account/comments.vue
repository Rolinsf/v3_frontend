<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '我的评论｜若林轻小说', description: '查看和管理自己发表的评论与回复。' })
const auth = useAuthStore()
const community = useComments()
const entries = community.myEntries(auth.user?.id ?? '')

function targetTo(comment: { targetType: 'novel' | 'chapter', targetId: string, novelId?: string }) {
  if (comment.targetType === 'novel') return `/novels/${comment.targetId}`
  return comment.novelId ? `/novels/${comment.novelId}/chapters/${comment.targetId}` : '/novels'
}

function remove(commentId: string, replyId?: string) {
  if (!auth.user || !window.confirm('确定删除这条内容吗？')) return
  community.deleteEntry(commentId, auth.user.id, replyId)
}
</script>

<template>
  <main class="my-comments-page">
    <div class="site-container my-comments-shell">
      <header><p>MY ACTIVITY</p><h1>我的评论</h1><span>管理你发表的作品评论、章节评论和回复。</span></header>
      <EmptyState
        v-if="entries.length === 0"
        icon="i-lucide-message-circle"
        title="还没有发表过评论"
        description="评论公开可读；只有发表和互动时才需要登录。"
        action-label="去书库看看"
        action-to="/novels"
      />
      <div
        v-else
        class="my-comments-list"
      >
        <article
          v-for="entry in entries"
          :key="entry.reply?.id ?? entry.comment.id"
        >
          <div class="my-comments-item__meta">
            <span>{{ entry.reply ? '回复' : entry.comment.targetType === 'novel' ? '作品评论' : '章节评论' }}</span><time :datetime="entry.reply?.createdAt ?? entry.comment.createdAt">{{ new Date(entry.reply?.createdAt ?? entry.comment.createdAt).toLocaleDateString('zh-CN') }}</time>
          </div>
          <p>{{ entry.reply?.content ?? entry.comment.content }}</p>
          <div>
            <UButton
              :to="targetTo(entry.comment)"
              label="查看原文"
              color="neutral"
              variant="outline"
              size="sm"
            /><UButton
              label="删除"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              @click="remove(entry.comment.id, entry.reply?.id)"
            />
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.my-comments-page { padding: 3rem 0 5rem; }.my-comments-shell { max-width: 780px; }.my-comments-shell > header { padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }.my-comments-shell > header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }.my-comments-shell h1 { margin-top: .25rem; font-family: var(--font-reading); font-size: 2.3rem; font-weight: 600; }.my-comments-shell > header span { color: var(--site-muted); font-size: .75rem; }.my-comments-list { display: grid; }.my-comments-list article { padding: 1.25rem 0; border-bottom: 1px solid var(--site-line); }.my-comments-item__meta { display: flex; gap: .6rem; color: var(--site-muted); font-size: .68rem; }.my-comments-list article > p { margin: .55rem 0 .8rem; font-size: .84rem; line-height: 1.75; }.my-comments-list article > div:last-child { display: flex; gap: .4rem; }
</style>

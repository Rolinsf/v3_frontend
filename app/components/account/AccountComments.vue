<script setup lang="ts">
const auth = useAuthStore()
const comments = useCommentsStore()
const entries = comments.myEntries(auth.user?.id ?? '')
const targetTo = (comment: { targetType: 'novel' | 'chapter', targetId: string, novelId?: string }) => comment.targetType === 'novel' ? `/novels/${comment.targetId}` : comment.novelId ? `/novels/${comment.novelId}/chapters/${comment.targetId}` : '/novels'
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
function remove(commentId: string, replyId?: string) {
  if (auth.user && import.meta.client && window.confirm('确定删除这条内容吗？')) comments.deleteEntry(commentId, auth.user.id, replyId)
}
</script>

<template>
  <header><h1>我的评论</h1><span>查看和管理你发表的评论与回复，共 {{ entries.length }} 条记录。</span></header>
  <EmptyState
    v-if="!entries.length"
    icon="i-lucide-message-circle"
    title="还没有发表过评论"
    description="去书库发现故事，留下你的第一条评论。"
    action-label="去书库看看"
    action-to="/novels"
  />
  <div
    v-else
    class="activity-list"
  >
    <article
      v-for="entry in entries"
      :key="entry.reply?.id ?? entry.comment.id"
    >
      <div class="item-meta">
        <span>{{ entry.reply ? '回复' : entry.comment.targetType === 'novel' ? '作品评论' : '章节评论' }}</span><time>{{ formatDate(entry.reply?.createdAt ?? entry.comment.createdAt) }}</time>
      </div>
      <p>{{ entry.reply?.content ?? entry.comment.content }}</p>
      <div class="item-actions">
        <UButton
          :to="targetTo(entry.comment)"
          label="查看原文"
          size="sm"
          color="neutral"
          variant="outline"
        /><UButton
          label="删除"
          icon="i-lucide-trash-2"
          size="sm"
          color="error"
          variant="ghost"
          @click="remove(entry.comment.id, entry.reply?.id)"
        />
      </div>
    </article>
  </div>
</template>

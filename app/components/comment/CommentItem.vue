<script setup lang="ts">
import type { Comment, Reply } from '~/types/comment'

defineProps<{ comment: Comment, revealed: boolean, canDelete: (reply?: Reply) => boolean }>()
const emit = defineEmits<{
  reveal: []
  like: [reply?: Reply]
  reply: [reply?: Reply]
  report: [reply?: Reply]
  remove: [reply?: Reply]
}>()
const relativeTime = (value: string) => {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`
  return `${Math.floor(minutes / 1440)} 天前`
}
</script>

<template>
  <article class="comment-card">
    <div class="comment-avatar">
      {{ comment.author.name.slice(0, 1) }}
    </div>
    <div class="comment-card__body">
      <header><strong>{{ comment.author.name }}</strong><time :datetime="comment.createdAt">{{ relativeTime(comment.createdAt) }}</time></header>
      <CommentSpoilerContent
        :content="comment.content"
        :hidden="comment.hasSpoiler && !revealed"
        @reveal="emit('reveal')"
      />
      <div class="comment-actions">
        <button
          type="button"
          :class="{ 'is-active': comment.likedByMe }"
          @click="emit('like')"
        >
          <UIcon name="i-lucide-heart" />{{ comment.likeCount || '赞' }}
        </button>
        <button
          type="button"
          @click="emit('reply')"
        >
          <UIcon name="i-lucide-reply" />回复
        </button>
        <button
          type="button"
          @click="emit('report')"
        >
          <UIcon name="i-lucide-flag" />举报
        </button>
        <button
          v-if="canDelete()"
          type="button"
          class="is-danger"
          @click="emit('remove')"
        >
          <UIcon name="i-lucide-trash-2" />删除
        </button>
      </div>
      <div
        v-if="comment.replies.length"
        class="reply-thread"
      >
        <article
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply-item"
        >
          <div class="reply-item__meta">
            <strong>{{ reply.author.name }}</strong><span v-if="reply.replyToId !== comment.id">回复对话串</span><time :datetime="reply.createdAt">{{ relativeTime(reply.createdAt) }}</time>
          </div>
          <p>{{ reply.content }}</p>
          <div class="comment-actions">
            <button
              type="button"
              :class="{ 'is-active': reply.likedByMe }"
              @click="emit('like', reply)"
            >
              <UIcon name="i-lucide-heart" />{{ reply.likeCount || '赞' }}
            </button>
            <button
              type="button"
              @click="emit('reply', reply)"
            >
              <UIcon name="i-lucide-reply" />回复
            </button>
            <button
              type="button"
              @click="emit('report', reply)"
            >
              <UIcon name="i-lucide-flag" />举报
            </button>
            <button
              v-if="canDelete(reply)"
              type="button"
              class="is-danger"
              @click="emit('remove', reply)"
            >
              删除
            </button>
          </div>
        </article>
      </div>
      <slot />
    </div>
  </article>
</template>

<style scoped>
.comment-card{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:.85rem;padding:1.4rem 0;border-bottom:1px solid var(--site-line)}.comment-avatar{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-100);color:var(--color-brand-800);font-size:.8rem}.comment-card__body{min-width:0}.comment-card header time{margin-left:.6rem;color:var(--site-muted);font-size:.68rem}.comment-actions{display:flex;flex-wrap:wrap;gap:.85rem}.comment-actions button{display:inline-flex;align-items:center;gap:.25rem;color:var(--site-muted);font-size:.7rem}.comment-actions button:hover,.comment-actions button.is-active{color:var(--color-brand-700)}.comment-actions button.is-danger{color:#a84d4d}.reply-thread{margin-top:1rem;padding:.25rem 1rem;border-left:2px solid var(--color-brand-100)}.reply-item{padding:.8rem 0;border-bottom:1px solid var(--site-line)}.reply-item__meta{display:flex;align-items:center;gap:.5rem;font-size:.72rem}.reply-item__meta span,.reply-item__meta time{color:var(--site-muted)}.reply-item p{margin:.4rem 0 .6rem;font-size:.8rem;line-height:1.7}@media(max-width:600px){.comment-card{grid-template-columns:2rem minmax(0,1fr)}.comment-avatar{width:2rem;height:2rem}}
</style>

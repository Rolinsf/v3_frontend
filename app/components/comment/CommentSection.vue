<script setup lang="ts">
import type { Comment, Reply } from '~/types/comment'
import { commentContentError } from '~/schemas/comment'

const props = defineProps<{ targetType: 'novel' | 'chapter', targetId: string, title: string, novelId?: string }>()
const route = useRoute()
const auth = useAuthStore()
const community = useComments()
const comments = community.list(props.targetType, props.targetId)
const composerOpen = ref(false)
const content = ref('')
const hasSpoiler = ref(false)
const contentError = ref('')
const revealedSpoilers = ref(new Set<string>())
const replyingTo = ref<{ comment: Comment, reply?: Reply }>()
const replyContent = ref('')
const replyError = ref('')

function requireLogin(action: string, targetId: string) {
  if (auth.user) return true
  auth.saveIntent({ redirect: route.fullPath, action, targetId })
  navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  return false
}

function openComposer() {
  if (!requireLogin('comment', props.targetId)) return
  composerOpen.value = true
  nextTick(() => document.querySelector<HTMLTextAreaElement>('.comment-composer textarea')?.focus())
}

function submitComment() {
  if (!auth.user) return
  contentError.value = commentContentError(content.value)
  if (contentError.value) return
  community.addComment(props.targetType, props.targetId, content.value, hasSpoiler.value, auth.user, props.novelId)
  content.value = ''
  hasSpoiler.value = false
  composerOpen.value = false
}

function openReply(comment: Comment, reply?: Reply) {
  if (!requireLogin('reply', comment.id)) return
  replyingTo.value = { comment, reply }
  replyContent.value = ''
  nextTick(() => document.querySelector<HTMLTextAreaElement>('.reply-composer textarea')?.focus())
}

function submitReply() {
  if (!auth.user || !replyingTo.value) return
  replyError.value = commentContentError(replyContent.value)
  if (replyError.value) return
  community.addReply(replyingTo.value.comment.id, replyContent.value, auth.user, replyingTo.value.reply?.id)
  replyingTo.value = undefined
}

function like(comment: Comment, reply?: Reply) {
  if (!requireLogin('like', reply?.id ?? comment.id)) return
  community.toggleLike(comment.id, auth.user!.id, reply?.id)
}

function report(comment: Comment, reply?: Reply) {
  if (!requireLogin('report', reply?.id ?? comment.id)) return
  if (window.confirm('确定举报这条内容吗？我们会交由管理员审核。')) community.report(comment.id, auth.user!.id, reply?.id)
}

function remove(comment: Comment, reply?: Reply) {
  if (!auth.user || !window.confirm('确定删除这条内容吗？')) return
  community.deleteEntry(comment.id, auth.user.id, reply?.id)
}

function canDelete(comment: Comment, reply?: Reply) {
  return auth.user?.id === (reply?.author.id ?? comment.author.id)
}

function reveal(id: string) {
  revealedSpoilers.value = new Set([...revealedSpoilers.value, id])
}

function relativeTime(value: string) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`
  return `${Math.floor(minutes / 1440)} 天前`
}

onMounted(() => {
  community.initialize()
  const intent = auth.peekResumedIntent()
  if (!intent) return
  if (intent.action === 'comment' && intent.targetId === props.targetId) {
    auth.clearResumedIntent()
    openComposer()
  } else if (intent.action === 'reply') {
    const comment = comments.value.find(item => item.id === intent.targetId)
    if (comment) {
      auth.clearResumedIntent()
      openReply(comment)
    }
  } else if (intent.action === 'like') {
    const comment = comments.value.find(item => item.id === intent.targetId || item.replies.some(reply => reply.id === intent.targetId))
    const reply = comment?.replies.find(item => item.id === intent.targetId)
    if (comment) {
      auth.clearResumedIntent()
      like(comment, reply)
    }
  }
})
</script>

<template>
  <section class="comment-section">
    <header class="comment-section__header">
      <div><p>COMMUNITY</p><h2>{{ title }}</h2><span>公开评论无需登录即可阅读</span></div>
      <UButton
        label="发表评论"
        icon="i-lucide-message-square-plus"
        @click="openComposer"
      />
    </header>

    <form
      v-if="composerOpen"
      class="comment-composer"
      @submit.prevent="submitComment"
    >
      <UTextarea
        v-model="content"
        :rows="4"
        placeholder="友善交流，也给不同的阅读感受留一点空间。"
      />
      <p
        v-if="contentError"
        class="comment-error"
      >
        {{ contentError }}
      </p>
      <div class="comment-composer__footer">
        <UCheckbox
          v-model="hasSpoiler"
          label="包含剧透，默认折叠"
        />
        <div>
          <UButton
            label="取消"
            color="neutral"
            variant="ghost"
            @click="composerOpen = false"
          /><UButton
            type="submit"
            label="发布评论"
          />
        </div>
      </div>
    </form>

    <EmptyState
      v-if="comments.length === 0"
      icon="i-lucide-message-circle"
      title="还没有评论"
      description="读完之后，留下第一条想法吧。"
    />
    <div
      v-else
      class="comment-list"
    >
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="comment-card"
      >
        <div class="comment-avatar">
          {{ comment.author.name.slice(0, 1) }}
        </div>
        <div class="comment-card__body">
          <header><div><strong>{{ comment.author.name }}</strong><time :datetime="comment.createdAt">{{ relativeTime(comment.createdAt) }}</time></div></header>
          <div
            v-if="comment.hasSpoiler && !revealedSpoilers.has(comment.id)"
            class="spoiler-cover"
          >
            <UIcon name="i-lucide-eye-off" /><span>这条评论包含剧透</span><button
              type="button"
              @click="reveal(comment.id)"
            >
              点击展开
            </button>
          </div>
          <p
            v-else
            class="comment-content"
          >
            {{ comment.content }}
          </p>
          <div class="comment-actions">
            <button
              type="button"
              :class="{ 'is-active': comment.likedByMe }"
              @click="like(comment)"
            >
              <UIcon name="i-lucide-heart" />{{ comment.likeCount || '赞' }}
            </button>
            <button
              type="button"
              @click="openReply(comment)"
            >
              <UIcon name="i-lucide-reply" />回复
            </button>
            <button
              type="button"
              @click="report(comment)"
            >
              <UIcon name="i-lucide-flag" />举报
            </button>
            <button
              v-if="canDelete(comment)"
              type="button"
              class="is-danger"
              @click="remove(comment)"
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
                  @click="like(comment, reply)"
                >
                  <UIcon name="i-lucide-heart" />{{ reply.likeCount || '赞' }}
                </button>
                <button
                  type="button"
                  @click="openReply(comment, reply)"
                >
                  <UIcon name="i-lucide-reply" />回复
                </button>
                <button
                  type="button"
                  @click="report(comment, reply)"
                >
                  <UIcon name="i-lucide-flag" />举报
                </button>
                <button
                  v-if="canDelete(comment, reply)"
                  type="button"
                  class="is-danger"
                  @click="remove(comment, reply)"
                >
                  删除
                </button>
              </div>
            </article>
          </div>

          <form
            v-if="replyingTo?.comment.id === comment.id"
            class="reply-composer"
            @submit.prevent="submitReply"
          >
            <p>回复 {{ replyingTo.reply?.author.name ?? comment.author.name }}</p>
            <UTextarea
              v-model="replyContent"
              :rows="3"
              placeholder="写下回复…"
            />
            <span
              v-if="replyError"
              class="comment-error"
            >{{ replyError }}</span>
            <div>
              <UButton
                label="取消"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="replyingTo = undefined"
              /><UButton
                type="submit"
                label="发送回复"
                size="sm"
              />
            </div>
          </form>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comment-section { margin-top: 3.5rem; }.comment-section__header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }.comment-section__header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }.comment-section__header h2 { margin-top: .2rem; font-size: 1.25rem; font-weight: 600; }.comment-section__header span { color: var(--site-muted); font-size: .7rem; }
.comment-composer, .reply-composer { margin-top: 1rem; padding: 1rem; border: 1px solid var(--site-line); border-radius: .75rem; background: var(--site-surface); }.comment-composer__footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: .75rem; }.comment-composer__footer > div, .reply-composer > div { display: flex; justify-content: flex-end; gap: .4rem; }.comment-error { color: #b84b4b; font-size: .72rem; }
.comment-list { display: grid; }.comment-card { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); gap: .85rem; padding: 1.4rem 0; border-bottom: 1px solid var(--site-line); }.comment-avatar { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--color-brand-100); color: var(--color-brand-800); font-size: .8rem; }.comment-card__body { min-width: 0; }.comment-card__body header strong { font-size: .82rem; }.comment-card__body header time { margin-left: .6rem; color: var(--site-muted); font-size: .68rem; }.comment-content { margin: .65rem 0; font-size: .86rem; line-height: 1.8; white-space: pre-wrap; }
.spoiler-cover { display: flex; align-items: center; gap: .5rem; margin: .65rem 0; padding: .8rem; border: 1px dashed var(--site-line); border-radius: .5rem; color: var(--site-muted); font-size: .78rem; }.spoiler-cover button { margin-left: auto; color: var(--color-brand-700); }.comment-actions { display: flex; flex-wrap: wrap; gap: .85rem; }.comment-actions button { display: inline-flex; align-items: center; gap: .25rem; color: var(--site-muted); font-size: .7rem; }.comment-actions button:hover, .comment-actions button.is-active { color: var(--color-brand-700); }.comment-actions button.is-danger { color: #a84d4d; }
.reply-thread { margin-top: 1rem; padding: .25rem 1rem; border-left: 2px solid var(--color-brand-100); background: color-mix(in srgb, var(--site-surface) 65%, transparent); }.reply-item { padding: .8rem 0; border-bottom: 1px solid var(--site-line); }.reply-item:last-child { border: 0; }.reply-item__meta { display: flex; align-items: center; gap: .5rem; font-size: .72rem; }.reply-item__meta span, .reply-item__meta time { color: var(--site-muted); }.reply-item p { margin: .4rem 0 .6rem; font-size: .8rem; line-height: 1.7; }.reply-composer > p { margin-bottom: .5rem; color: var(--site-muted); font-size: .72rem; }
@media (max-width: 600px) { .comment-section__header { align-items: flex-start; }.comment-composer__footer { align-items: flex-start; flex-direction: column; }.comment-card { grid-template-columns: 2rem minmax(0, 1fr); }.comment-avatar { width: 2rem; height: 2rem; }.reply-thread { padding-right: .25rem; } }
</style>

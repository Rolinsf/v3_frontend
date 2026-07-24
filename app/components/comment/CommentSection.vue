<script setup lang="ts">
import type { Comment, Reply } from '~/types/comment'
import { commentContentError } from '~/schemas/comment'

const props = defineProps<{ targetType: 'novel' | 'chapter', targetId: string, title: string, novelId?: string }>()
const route = useRoute()
const auth = useAuthStore()
const community = useComments()
const comments = community.list(props.targetType, props.targetId)
const currentPage = ref(1)
const pageSize = 8
const visibleComments = computed(() => comments.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
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
  try {
    community.addComment(props.targetType, props.targetId, content.value, hasSpoiler.value, auth.user, props.novelId)
  } catch (cause) {
    contentError.value = cause instanceof Error ? cause.message : '发布失败'
    return
  }
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
  try {
    community.addReply(replyingTo.value.comment.id, replyContent.value, auth.user, replyingTo.value.reply?.id)
  } catch (cause) {
    replyError.value = cause instanceof Error ? cause.message : '回复失败'
    return
  }
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

function canDeleteFor(comment: Comment) {
  return (reply?: Reply) => canDelete(comment, reply)
}

function handleLike(comment: Comment, reply?: Reply) {
  like(comment, reply)
}
function handleReply(comment: Comment, reply?: Reply) {
  openReply(comment, reply)
}
function handleReport(comment: Comment, reply?: Reply) {
  report(comment, reply)
}
function handleRemove(comment: Comment, reply?: Reply) {
  remove(comment, reply)
}

function reveal(id: string) {
  revealedSpoilers.value = new Set([...revealedSpoilers.value, id])
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

    <CommentComposer
      v-if="composerOpen"
      v-model="content"
      v-model:spoiler="hasSpoiler"
      :error="contentError"
      @submit="submitComment"
      @cancel="composerOpen = false"
    />

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
      <CommentItem
        v-for="comment in visibleComments"
        :key="comment.id"
        :comment="comment"
        :revealed="revealedSpoilers.has(comment.id)"
        :can-delete="canDeleteFor(comment)"
        @reveal="reveal(comment.id)"
        @like="handleLike(comment, $event)"
        @reply="handleReply(comment, $event)"
        @report="handleReport(comment, $event)"
        @remove="handleRemove(comment, $event)"
      >
        <CommentComposer
          v-if="replyingTo?.comment.id === comment.id"
          v-model="replyContent"
          :error="replyError"
          :reply-to="replyingTo.reply?.author.name ?? comment.author.name"
          @submit="submitReply"
          @cancel="replyingTo = undefined"
        />
      </CommentItem>
    </div>
    <UPagination
      v-if="comments.length > pageSize"
      v-model:page="currentPage"
      :total="comments.length"
      :items-per-page="pageSize"
      class="comment-pagination"
    />
  </section>
</template>

<style scoped>
.comment-section { margin-top: 3.5rem; }.comment-section__header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--site-line); }.comment-section__header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }.comment-section__header h2 { margin-top: .2rem; font-size: 1.25rem; font-weight: 600; }.comment-section__header span { color: var(--site-muted); font-size: .7rem; }
.comment-list { display: grid; }
@media (max-width: 600px) { .comment-section__header { align-items: flex-start; } }
</style>

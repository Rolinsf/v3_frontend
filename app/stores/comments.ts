import { defineStore } from 'pinia'
import type { AuthUser } from '~/types/auth'
import type { Comment, CommunityNotification, Reply } from '~/types/comment'
import { initialComments } from '~/fixtures/comments'

const COMMENTS_KEY = 'wakabayashi-comments-v1'
const NOTIFICATIONS_KEY = 'wakabayashi-notifications-v1'

function cloneFixtures() {
  return structuredClone(initialComments) as Comment[]
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const notifications = ref<CommunityNotification[]>([])
  const initialized = ref(false)
  const unreadCount = computed(() => notifications.value.filter(item => !item.read).length)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments.value))
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.value))
    } catch {
      // 本地存储不可用时保留当前会话状态。
    }
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    comments.value = readLocal(COMMENTS_KEY, cloneFixtures())
    notifications.value = readLocal(NOTIFICATIONS_KEY, [])
    initialized.value = true
  }

  function list(targetType: Comment['targetType'], targetId: string) {
    return computed(() => comments.value
      .filter(comment => comment.targetType === targetType && comment.targetId === targetId && comment.status === 'published')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  function addComment(targetType: Comment['targetType'], targetId: string, content: string, hasSpoiler: boolean, user: AuthUser, novelId?: string) {
    if (targetType === 'chapter' && !novelId) throw new Error('章节评论必须关联作品。')
    const comment: Comment = {
      id: uid('comment'), targetType, targetId, novelId,
      author: { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
      content, hasSpoiler, createdAt: new Date().toISOString(), likeCount: 0,
      replyCount: 0, replies: [], status: 'published', canDelete: true
    }
    comments.value = [comment, ...comments.value]
    persist()
    return comment
  }

  function addReply(commentId: string, content: string, user: AuthUser, replyToId?: string) {
    const reply: Reply = {
      id: uid('reply'), author: { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
      content, createdAt: new Date().toISOString(), likeCount: 0,
      replyToId: replyToId ?? commentId, canDelete: true
    }
    comments.value = comments.value.map(comment => comment.id === commentId
      ? { ...comment, replies: [...comment.replies, reply], replyCount: comment.replyCount + 1 }
      : comment)
    persist()
    return reply
  }

  function toggleLike(commentId: string, userId: string, replyId?: string) {
    comments.value = comments.value.map((comment) => {
      if (comment.id !== commentId) return comment
      if (replyId) {
        return { ...comment, replies: comment.replies.map(reply => reply.id === replyId
          ? { ...reply, likedByMe: !reply.likedByMe, likeCount: Math.max(0, reply.likeCount + (reply.likedByMe ? -1 : 1)) }
          : reply) }
      }
      const liked = !comment.likedByMe
      if (liked && comment.author.id === userId) return comment
      return { ...comment, likedByMe: liked, likeCount: Math.max(0, comment.likeCount + (liked ? 1 : -1)) }
    })
    persist()
  }

  function deleteEntry(commentId: string, userId: string, replyId?: string) {
    const target = comments.value.find(comment => comment.id === commentId)
    if (!target) return
    if (replyId) {
      const reply = target.replies.find(item => item.id === replyId)
      if (!reply || reply.author.id !== userId) return
      comments.value = comments.value.map(comment => comment.id === commentId
        ? { ...comment, replies: comment.replies.filter(item => item.id !== replyId), replyCount: Math.max(0, comment.replyCount - 1) }
        : comment)
    } else if (target.author.id === userId) {
      comments.value = comments.value.filter(comment => comment.id !== commentId)
    }
    persist()
  }

  function report(commentId: string, userId: string, replyId?: string) {
    notifications.value = [{
      id: uid('notification'), type: 'system', title: '举报已提交',
      description: `我们会审核你提交的${replyId ? '回复' : '评论'}举报。`,
      createdAt: new Date().toISOString(), read: false
    }, ...notifications.value]
    persist()
    return { commentId, replyId, userId }
  }

  function markAllRead() {
    notifications.value = notifications.value.map(item => ({ ...item, read: true }))
    persist()
  }

  function myEntries(userId: string) {
    return computed(() => comments.value.flatMap((comment) => {
      const result: Array<{ comment: Comment, reply?: Reply }> = []
      if (comment.author.id === userId) result.push({ comment })
      for (const reply of comment.replies) if (reply.author.id === userId) result.push({ comment, reply })
      return result
    }).sort((a, b) => (b.reply?.createdAt ?? b.comment.createdAt).localeCompare(a.reply?.createdAt ?? a.comment.createdAt)))
  }

  return { comments, notifications, initialized, unreadCount, initialize, list, addComment, addReply, toggleLike, deleteEntry, report, markAllRead, myEntries }
})

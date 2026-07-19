import type { UserSummary } from './user'

// 评论领域类型：覆盖作品评论与章节评论。
// 评论主体（novelId 或 chapterId）由调用方决定，类型不在此耦合。

export type CommentStatus = 'published' | 'pending' | 'deleted' | 'hidden'

export interface Reply {
  id: string
  author: UserSummary
  content: string
  createdAt: string
  updatedAt?: string
  likeCount: number
  /** 当前用户是否已点赞。 */
  likedByMe?: boolean
  /** 回复的目标评论 ID 或目标回复 ID。 */
  replyToId?: string
  /** 当前用户是否可删除。 */
  canDelete?: boolean
}

export interface CommunityNotification {
  id: string
  type: 'reply' | 'like' | 'system'
  title: string
  description: string
  to?: string
  createdAt: string
  read: boolean
}

export interface Comment {
  id: string
  /** 评论主体类型：作品评论或章节评论。 */
  targetType: 'novel' | 'chapter'
  /** 评论主体 ID：novelId 或 chapterId。 */
  targetId: string
  /** 章节评论所属的作品 ID；作品评论无需提供。 */
  novelId?: string
  author: UserSummary
  content: string
  /** 是否包含剧透；前端据此折叠内容。 */
  hasSpoiler: boolean
  createdAt: string
  updatedAt?: string
  likeCount: number
  replyCount: number
  replies: Reply[]
  likedByMe?: boolean
  /** 当前用户是否可删除（作者本人或管理员）。 */
  canDelete?: boolean
  status: CommentStatus
}

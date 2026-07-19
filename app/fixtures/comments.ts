import type { Comment } from '~/types/comment'

export const initialComments: Comment[] = [
  {
    id: 'comment-rain-1', targetType: 'novel', targetId: 'rain-letter',
    author: { id: 'reader-kaze', name: '风从书页来', role: 'reader', bio: '慢慢读，慢慢生活。' },
    content: '旧图书馆和雨季的气味写得很真。人物没有急着靠近，反而让每一次对话都显得珍贵。',
    hasSpoiler: false, createdAt: '2026-07-18T20:16:00+08:00', likeCount: 18, replyCount: 2, status: 'published',
    replies: [
      { id: 'reply-rain-1', author: { id: 'reader-mugi', name: '麦茶半杯', role: 'reader' }, content: '同感，留白特别舒服。', createdAt: '2026-07-18T21:03:00+08:00', likeCount: 3, replyToId: 'comment-rain-1' },
      { id: 'reply-rain-2', author: { id: 'aoki', name: '青木与夏', role: 'author' }, content: '谢谢你愿意停下来感受这些留白。', createdAt: '2026-07-19T08:12:00+08:00', likeCount: 7, replyToId: 'reply-rain-1' }
    ]
  },
  {
    id: 'comment-rain-2', targetType: 'novel', targetId: 'rain-letter',
    author: { id: 'reader-hoshi', name: '星灯', role: 'reader' },
    content: '第三章最后出现的那封信，可能并不是写给澄野的。这个伏笔让我很期待后续。',
    hasSpoiler: true, createdAt: '2026-07-17T23:40:00+08:00', likeCount: 9, replyCount: 0, replies: [], status: 'published'
  },
  {
    id: 'comment-ch1-1', targetType: 'chapter', targetId: 'ch-1', novelId: 'rain-letter',
    author: { id: 'reader-mugi', name: '麦茶半杯', role: 'reader' },
    content: '连廊下停住脚步的开场很安静，一下子就进入雨季了。',
    hasSpoiler: false, createdAt: '2026-07-16T19:22:00+08:00', likeCount: 6, replyCount: 0, replies: [], status: 'published'
  }
]

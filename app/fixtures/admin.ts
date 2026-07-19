import type { AdminData } from '~/types/admin'
import { categoryTree } from '~/fixtures/novels'

export const initialAdminData: AdminData = {
  categories: JSON.parse(JSON.stringify(categoryTree)),
  tags: [
    { id: 'tag-healing', name: '治愈', slug: 'healing', enabled: true, novelCount: 12 },
    { id: 'tag-slow', name: '慢热', slug: 'slow', enabled: true, novelCount: 8 },
    { id: 'tag-adventure', name: '冒险', slug: 'adventure', enabled: true, novelCount: 9 }
  ],
  reviews: [
    { id: 'review-1', type: 'novel', title: '月台尽头的蓝色邮筒', authorName: '纸舟', submittedAt: '2026-07-19T08:20:00+08:00', status: 'pending' },
    { id: 'review-2', type: 'chapter', title: '第十二章 风暴之前', authorName: '森下遥', submittedAt: '2026-07-19T07:10:00+08:00', status: 'pending' }
  ],
  reports: [
    { id: 'report-1', targetType: 'comment', targetSummary: '评论含有人身攻击内容', reporterName: '麦茶半杯', reason: '不友善言论', createdAt: '2026-07-19T09:00:00+08:00', status: 'pending' }
  ],
  users: [
    { id: 'reader-kaze', name: '风从书页来', role: 'reader', joinedAt: '2025-03-12T00:00:00+08:00', banned: false },
    { id: 'author-paper', name: '纸舟', role: 'author', joinedAt: '2024-11-08T00:00:00+08:00', banned: false }
  ]
}

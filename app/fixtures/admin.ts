import type { AdminData } from '~/types/admin'
import { categoryTree } from '~/fixtures/novels'

const discoveryMockLabels = [
  ['18岁天才美少女玖酱', 1], ['2024七月活动', 2], ['2024万圣夜三题', 1], ['2024九月活动', 2],
  ['2024八月活动', 3], ['2024十一月活动', 1], ['2024十二月活动和2025寒假活动', 1], ['2024十月活动', 2],
  ['2024双十一前夕三题', 1], ['2024秋千·氯化钠·豆浆', 1], ['2025年三月活动', 3], ['2025年二月活动', 1],
  ['2025年八月活动', 3], ['2025年六月活动', 1], ['2025年十一月活动', 1], ['2025年十月活动', 1],
  ['2025年四月活动', 1], ['2026年六月活动', 1], ['Best Kirito', 1], ['BestKirito', 1],
  ['BingQLo', 1], ['EDGUzi', 1], ['Mirach', 1], ['Stuka', 1], ['krit', 1], ['meag耿鬼', 2],
  ['七月的端粒', 1], ['三题', 2], ['东堂灯子', 1], ['今非今', 1], ['以目示爱', 1], ['仄面', 2],
  ['保罗·琼斯', 1], ['冬之岛春秋', 1], ['冬菇滑稽粥', 3], ['冰蝶入梦', 1],
  ['初届若林轻小说大赏', 3], ['勿忘我', 1], ['十顾云布', 1], ['半稽半虾堡', 1],
  ['南镇祈梦', 1], ['寿比南山', 1], ['常青藤', 1], ['异世界公路文', 2], ['数据偏移', 1],
  ['方秩荃', 1], ['无光幻象', 1], ['木卫一', 1], ['梅乐斯', 1], ['浩瀚星空一希白', 1],
  ['爱丽丝', 2], ['胡泊Q人', 2], ['花花', 1], ['蕾丝花边小白袜', 1], ['衔尾鱼', 1],
  ['铁竹风华', 1], ['铃风', 3], ['阿肆', 2], ['阿鬼哟', 1], ['陌莉丝', 1], ['零七二一', 1],
  ['马尾酱', 1], ['鬼在潜水中', 1], ['鲨鱼', 2], ['麦克白不白', 1]
] as const

const discoveryMockItems = discoveryMockLabels.map(([label, emphasis], index) => ({
  id: `discovery-mock-${index + 1}`,
  label,
  url: `/search?q=${encodeURIComponent(label)}`,
  type: 'author' as const,
  emphasis,
  order: (index + 1) * 10,
  enabled: true
}))

export const initialAdminData: AdminData = {
  discoveryItems: discoveryMockItems,
  footer: {
    copyright: '© 2023 若林轻小说 All rights reserved.',
    secondaryText: 'Q群：736798421',
    links: [
      { id: 'footer-navigation', label: '若林导航', url: 'https://dh.rolinsf.top/', order: 10, enabled: true },
      { id: 'footer-archives', label: '若林档案馆', url: 'https://rolinsf.github.io/rolinsf-archives/', order: 20, enabled: true }
    ]
  },
  categories: JSON.parse(JSON.stringify(categoryTree)),
  tags: [
    { id: 'slow', name: '慢热', slug: 'slow', enabled: true, novelCount: 1 },
    { id: 'healing', name: '治愈', slug: 'healing', enabled: true, novelCount: 2 },
    { id: 'adventure', name: '冒险', slug: 'adventure', enabled: true, novelCount: 1 },
    { id: 'group', name: '群像', slug: 'group', enabled: true, novelCount: 1 },
    { id: 'mystery', name: '悬疑', slug: 'mystery', enabled: true, novelCount: 1 },
    { id: 'warm', name: '温情', slug: 'warm', enabled: true, novelCount: 1 },
    { id: 'food', name: '美食', slug: 'food', enabled: true, novelCount: 1 }
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

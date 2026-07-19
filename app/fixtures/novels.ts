import type { Category, ChapterContent, NovelDetail, NovelSummary } from '~/types/novel'

// 固定 fixtures：阶段 2-7 使用的稳定 mock 数据。
// 阶段 8 接入真实 API 时，只需在 useNovels 中切换数据源，fixtures 可保留供测试使用。

export const novelSummaries: NovelSummary[] = [
  {
    id: 'rain-letter',
    title: '写给雨季的第七封信',
    author: { id: 'aoki', name: '青木与夏' },
    synopsis: '转学生澄野在旧图书馆发现一封没有寄出的信，也因此认识了只在雨天出现的少女。',
    coverTone: 'sage',
    category: { primary: '日常', secondary: '青春校园' },
    tags: [{ id: 'slow', name: '慢热' }, { id: 'healing', name: '治愈' }],
    status: 'serializing',
    wordCount: 128600,
    updatedAt: '2026-07-17T12:30:00+08:00',
    latestChapter: { id: 'ch-3', title: '第三章 雨停以前' }
  },
  {
    id: 'lantern-sea',
    title: '提灯穿过无声之海',
    author: { id: 'mori', name: '森下遥' },
    synopsis: '少女提着一盏不会熄灭的灯，在被遗忘的海岸寻找失踪多年的哥哥。',
    coverTone: 'blue',
    category: { primary: '奇幻', secondary: '冒险幻想' },
    tags: [{ id: 'adventure', name: '冒险' }, { id: 'group', name: '群像' }],
    status: 'serializing',
    wordCount: 216400,
    updatedAt: '2026-07-16T20:10:00+08:00',
    latestChapter: { id: 'ch-18', title: '第十八章 潮汐留下的名字' }
  },
  {
    id: 'star-station',
    title: '银河尽头的末班电车',
    author: { id: 'natsu', name: '夏至之后' },
    synopsis: '每晚零点，废弃站台都会驶来一班载着遗憾的电车。',
    coverTone: 'violet',
    category: { primary: '科幻', secondary: '幻想未来' },
    tags: [{ id: 'mystery', name: '悬疑' }, { id: 'warm', name: '温情' }],
    status: 'completed',
    wordCount: 184200,
    updatedAt: '2026-07-12T09:00:00+08:00',
    latestChapter: { id: 'ch-24', title: '终章 我们终会抵达' }
  },
  {
    id: 'cat-cafe',
    title: '猫与星期三的咖啡馆',
    author: { id: 'shiro', name: '白川灯' },
    synopsis: '只在星期三营业的咖啡馆，会为迷路的人准备一杯刚刚好的饮料。',
    coverTone: 'warm',
    category: { primary: '日常', secondary: '都市生活' },
    tags: [{ id: 'food', name: '美食' }, { id: 'healing', name: '治愈' }],
    status: 'serializing',
    wordCount: 76200,
    updatedAt: '2026-07-15T18:40:00+08:00',
    latestChapter: { id: 'ch-8', title: '第八章 焦糖布丁与旧钥匙' }
  }
]

export const featuredNovelDetail: NovelDetail = {
  ...novelSummaries[0]!,
  announcement: '本卷每周三、周六更新。谢谢你愿意走进这个雨季。',
  bookshelfCount: 2381,
  volumes: [
    {
      id: 'vol-1',
      title: '第一卷 潮湿的春天',
      description: '那年春天，雨比往常来得更早。',
      chapters: [
        { id: 'ch-1', title: '第一章 没有收件人的信', order: 1, wordCount: 3260, publishedAt: '2026-06-21T20:00:00+08:00' },
        { id: 'ch-2', title: '第二章 旧图书馆的窗', order: 2, wordCount: 3480, publishedAt: '2026-06-28T20:00:00+08:00' },
        { id: 'ch-3', title: '第三章 雨停以前', order: 3, wordCount: 3710, publishedAt: '2026-07-17T12:30:00+08:00', isLatest: true }
      ]
    }
  ]
}

const additionalNovelDetails: NovelDetail[] = [
  {
    ...novelSummaries[1]!, announcement: '每周更新一章，愿灯光陪你穿过雾海。', bookshelfCount: 1742,
    volumes: [{ id: 'lantern-vol-1', title: '第一卷 无声海岸', chapters: [{ id: 'ch-18', title: '第十八章 潮汐留下的名字', order: 18, wordCount: 3920, publishedAt: novelSummaries[1]!.updatedAt, isLatest: true }] }]
  },
  {
    ...novelSummaries[2]!, announcement: '故事已经完结，感谢你乘坐这班夜间电车。', bookshelfCount: 2056,
    volumes: [{ id: 'station-vol-1', title: '终点站', chapters: [{ id: 'ch-24', title: '终章 我们终会抵达', order: 24, wordCount: 4280, publishedAt: novelSummaries[2]!.updatedAt, isLatest: true }] }]
  },
  {
    ...novelSummaries[3]!, announcement: '咖啡馆只在星期三营业，请慢慢享用。', bookshelfCount: 986,
    volumes: [{ id: 'cafe-vol-1', title: '第一卷 星期三菜单', chapters: [{ id: 'ch-8', title: '第八章 焦糖布丁与旧钥匙', order: 8, wordCount: 3540, publishedAt: novelSummaries[3]!.updatedAt, isLatest: true }] }]
  }
]

/** 所有可公开访问的作品详情；摘要、详情与章节正文必须保持自洽。 */
export const novelDetails: NovelDetail[] = [featuredNovelDetail, ...additionalNovelDetails]

export const chapterContents: Record<string, ChapterContent> = {
  'ch-1': {
    ...featuredNovelDetail.volumes[0]!.chapters[0]!,
    novelId: featuredNovelDetail.id,
    novelTitle: featuredNovelDetail.title,
    volumeTitle: '第一卷 潮湿的春天',
    nextChapterId: 'ch-2',
    paragraphs: [
      '四月的第一个星期一，雨从清晨开始落。',
      '澄野抱着刚领到的课本，站在教学楼与旧图书馆之间的连廊下。雨丝被风吹得很斜，在水泥地面画出一层薄薄的白雾。新学校的铃声从身后传来，他却没有立刻回教室。',
      '旧图书馆的门没有锁。推开时，木轴发出一声很轻的叹息。空气里是纸张、灰尘与潮湿木头混合的气味，像某个被折好后遗忘了很久的下午。',
      '他在靠窗的长桌上看见那封信。信封已经微微泛黄，只写着一句话：给那个会在雨天来到这里的人。',
      '澄野回头望了一眼。门边不知什么时候站着一个穿浅色校服的少女。她的发梢沾着雨水，手里却没有伞。',
      '“你果然来了。”她说。'
    ],
    authorNote: '这是故事真正开始的地方。愿你也能听见旧图书馆窗外的雨声。'
  },
  'ch-2': {
    ...featuredNovelDetail.volumes[0]!.chapters[1]!, novelId: 'rain-letter', novelTitle: featuredNovelDetail.title, volumeTitle: '第一卷 潮湿的春天', previousChapterId: 'ch-1', nextChapterId: 'ch-3',
    paragraphs: ['旧图书馆的窗框被雨水浸成深褐色。', '澄野第二次推门时，少女正踮脚整理最高一层的旧书。', '窗外的雨声很密，他们却第一次认真交换了名字。']
  },
  'ch-3': {
    ...featuredNovelDetail.volumes[0]!.chapters[2]!, novelId: 'rain-letter', novelTitle: featuredNovelDetail.title, volumeTitle: '第一卷 潮湿的春天', previousChapterId: 'ch-2',
    paragraphs: ['雨在放学前停了，屋檐仍一滴一滴地落着水。', '少女把第二封信留在长桌上，没有告别。', '澄野拆开信封，终于明白收件人的名字一直被藏在折痕里。']
  },
  'ch-18': {
    ...additionalNovelDetails[0]!.volumes[0]!.chapters[0]!, novelId: 'lantern-sea', novelTitle: novelSummaries[1]!.title, volumeTitle: '第一卷 无声海岸', paragraphs: ['潮水退去后，沙滩上出现了一行从未见过的字。', '灯焰向海面倾斜，像是在为某个迟归的人指路。']
  },
  'ch-24': {
    ...additionalNovelDetails[1]!.volumes[0]!.chapters[0]!, novelId: 'star-station', novelTitle: novelSummaries[2]!.title, volumeTitle: '终点站', paragraphs: ['末班电车穿过最后一片星云，车窗外终于出现清晨。', '站台上的人们带着各自的答案下车，而列车仍会在下一个午夜出发。']
  },
  'ch-8': {
    ...additionalNovelDetails[2]!.volumes[0]!.chapters[0]!, novelId: 'cat-cafe', novelTitle: novelSummaries[3]!.title, volumeTitle: '第一卷 星期三菜单', paragraphs: ['烤箱发出轻响，焦糖的甜香慢慢填满店里。', '猫从柜台下叼出一把旧钥匙，放在等待已久的客人面前。']
  }
}

/** 两级分类树：首页"按分类散步"和书库筛选共用。 */
export const categoryTree: Category[] = [
  {
    id: 'cat-fantasy',
    name: '奇幻',
    slug: 'fantasy',
    description: '魔法、异世界与古老传说。',
    icon: 'i-lucide-wand-2',
    enabled: true,
    novelCount: 12,
    children: [
      { id: 'cat-fantasy-isekai', name: '异世界', slug: 'isekai', enabled: true, novelCount: 5 },
      { id: 'cat-fantasy-magic', name: '魔法校园', slug: 'magic-campus', enabled: true, novelCount: 4 },
      { id: 'cat-fantasy-eastern', name: '东方奇幻', slug: 'eastern', enabled: true, novelCount: 3 }
    ]
  },
  {
    id: 'cat-daily',
    name: '日常',
    slug: 'daily',
    description: '细水长流的生活与人心。',
    icon: 'i-lucide-coffee',
    enabled: true,
    novelCount: 18,
    children: [
      { id: 'cat-daily-campus', name: '青春校园', slug: 'campus', enabled: true, novelCount: 8 },
      { id: 'cat-daily-city', name: '都市生活', slug: 'city', enabled: true, novelCount: 6 },
      { id: 'cat-daily-food', name: '美食治愈', slug: 'food', enabled: true, novelCount: 4 }
    ]
  },
  {
    id: 'cat-scifi',
    name: '科幻',
    slug: 'scifi',
    description: '未来、太空与可能的明天。',
    icon: 'i-lucide-rocket',
    enabled: true,
    novelCount: 9,
    children: [
      { id: 'cat-scifi-future', name: '幻想未来', slug: 'future', enabled: true, novelCount: 5 },
      { id: 'cat-scifi-space', name: '太空歌剧', slug: 'space', enabled: true, novelCount: 2 },
      { id: 'cat-scifi-cyber', name: '赛博朋克', slug: 'cyber', enabled: true, novelCount: 2 }
    ]
  },
  {
    id: 'cat-mystery',
    name: '悬疑',
    slug: 'mystery',
    description: '迷雾、线索与未解之谜。',
    icon: 'i-lucide-magnifying-glass',
    enabled: true,
    novelCount: 7,
    children: [
      { id: 'cat-mystery-detective', name: '本格推理', slug: 'detective', enabled: true, novelCount: 3 },
      { id: 'cat-mystery-thriller', name: '惊悚悬疑', slug: 'thriller', enabled: true, novelCount: 4 }
    ]
  },
  {
    id: 'cat-romance',
    name: '恋爱',
    slug: 'romance',
    description: '心动、错过与重逢。',
    icon: 'i-lucide-heart',
    enabled: true,
    novelCount: 14,
    children: [
      { id: 'cat-romance-sweet', name: '甜文', slug: 'sweet', enabled: true, novelCount: 6 },
      { id: 'cat-romance-slow', name: '慢热治愈', slug: 'slow', enabled: true, novelCount: 5 },
      { id: 'cat-romance-sad', name: '虐恋', slug: 'sad', enabled: true, novelCount: 3 }
    ]
  },
  {
    id: 'cat-history',
    name: '历史',
    slug: 'history',
    description: '故纸堆里的旧时光。',
    icon: 'i-lucide-scroll',
    enabled: true,
    novelCount: 5,
    children: [
      { id: 'cat-history-cn', name: '历史架空', slug: 'cn-alt', enabled: true, novelCount: 3 },
      { id: 'cat-history-jp', name: '和风时代', slug: 'jp-era', enabled: true, novelCount: 2 }
    ]
  }
]

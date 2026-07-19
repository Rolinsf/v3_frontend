/**
 * 全站唯一 API endpoint 注册表。
 * 页面和领域 composable 不得自行拼接后端路径；后端契约确定后只调整此处。
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login', register: '/auth/register', logout: '/auth/logout', session: '/auth/session'
  },
  novels: {
    list: '/novels', detail: (novelId: string) => `/novels/${novelId}`,
    chapter: (novelId: string, chapterId: string) => `/novels/${novelId}/chapters/${chapterId}`,
    rankings: '/rankings', categories: '/categories', tags: '/tags'
  },
  bookshelf: { list: '/bookshelf', item: (novelId: string) => `/bookshelf/${novelId}` },
  progress: { list: '/reading-progress', item: (novelId: string) => `/reading-progress/${novelId}` },
  comments: {
    list: '/comments', detail: (commentId: string) => `/comments/${commentId}`,
    replies: (commentId: string) => `/comments/${commentId}/replies`,
    like: (commentId: string) => `/comments/${commentId}/like`,
    report: (commentId: string) => `/comments/${commentId}/report`
  },
  notifications: { list: '/notifications', readAll: '/notifications/read-all' },
  creator: {
    novels: '/creator/novels', novel: (novelId: string) => `/creator/novels/${novelId}`,
    volumes: (novelId: string) => `/creator/novels/${novelId}/volumes`,
    chapters: (novelId: string, volumeId: string) => `/creator/novels/${novelId}/volumes/${volumeId}/chapters`,
    chapter: (novelId: string, chapterId: string) => `/creator/novels/${novelId}/chapters/${chapterId}`,
    publish: (novelId: string, chapterId: string) => `/creator/novels/${novelId}/chapters/${chapterId}/publish`
  },
  uploads: { prepare: '/uploads/prepare', complete: '/uploads/complete' },
  admin: {
    categories: '/admin/categories', category: (id: string) => `/admin/categories/${id}`,
    tags: '/admin/tags', tag: (id: string) => `/admin/tags/${id}`,
    reviews: '/admin/reviews', review: (id: string) => `/admin/reviews/${id}`,
    reports: '/admin/reports', report: (id: string) => `/admin/reports/${id}`,
    users: '/admin/users', ban: (id: string) => `/admin/users/${id}/ban`
  }
} as const

export interface AuthorFollow {
  authorId: string
  followedAt: string
}

export interface NovelUpdatePreference {
  novelId: string
  notificationsEnabled: boolean
  followedAt: string
  lastSeenUpdateAt?: string
}

export const FOLLOWING_STORAGE_KEY = 'wakabayashi-following'

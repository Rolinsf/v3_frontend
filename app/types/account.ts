export interface AccountPreferences {
  reading: {
    syncProgress: boolean
    autoMarkRead: boolean
  }
  notifications: {
    replies: boolean
    mentions: boolean
    likes: boolean
    novelUpdates: boolean
    reviews: boolean
  }
  privacy: {
    showFollowing: boolean
    showBookshelf: boolean
    showContributions: boolean
  }
}

export interface AccountDevice {
  id: string
  name: string
  lastActiveAt: string
  current: boolean
}

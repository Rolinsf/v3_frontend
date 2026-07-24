import { defineStore } from 'pinia'
import type { AccountDevice, AccountPreferences } from '~/types/account'

const STORAGE_KEY = 'wakabayashi-account-settings-v1'
const DEFAULTS: AccountPreferences = {
  reading: { syncProgress: true, autoMarkRead: true },
  notifications: { replies: true, mentions: true, likes: true, novelUpdates: true, reviews: true },
  privacy: { showFollowing: false, showBookshelf: false, showContributions: true }
}

export const useAccountStore = defineStore('account', () => {
  const preferences = ref<AccountPreferences>(structuredClone(DEFAULTS))
  const devices = ref<AccountDevice[]>([])
  const initialized = ref(false)

  function persist() {
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences: preferences.value, devices: devices.value }))
  }
  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<{ preferences: AccountPreferences, devices: AccountDevice[] }>
      preferences.value = {
        reading: { ...DEFAULTS.reading, ...saved.preferences?.reading },
        notifications: { ...DEFAULTS.notifications, ...saved.preferences?.notifications },
        privacy: { ...DEFAULTS.privacy, ...saved.preferences?.privacy }
      }
      devices.value = saved.devices?.length ? saved.devices : [{ id: 'current-browser', name: navigator.userAgent.includes('Mobile') ? '当前移动设备' : '当前浏览器', lastActiveAt: new Date().toISOString(), current: true }]
    } catch {
      preferences.value = structuredClone(DEFAULTS)
    }
    initialized.value = true
    persist()
  }
  function update(next: AccountPreferences) {
    preferences.value = structuredClone(next)
    persist()
  }
  function removeDevice(id: string) {
    devices.value = devices.value.filter(device => device.current || device.id !== id)
    persist()
  }
  function changePassword(current: string, next: string) {
    if (current.length < 8 || next.length < 8) throw new Error('密码至少需要 8 位。')
    return true
  }
  return { preferences, devices, initialized, initialize, update, removeDevice, changePassword }
})

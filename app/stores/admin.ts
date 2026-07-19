import { defineStore } from 'pinia'
import type { AdminData, DiscoveryItem, FooterConfig, FooterLink } from '~/types/admin'
import { initialAdminData } from '~/fixtures/admin'

const STORAGE_KEY = 'wakabayashi-admin-data-v6'
const cloneInitial = () => structuredClone(initialAdminData) as AdminData
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
const isSafeFooterUrl = (url: string) => url.startsWith('/') || url.startsWith('https://') || url.startsWith('mailto:')

export const useAdminStore = defineStore('admin', () => {
  const data = ref<AdminData>(cloneInitial())
  const initialized = ref(false)
  const pendingReviews = computed(() => data.value.reviews.filter(item => item.status === 'pending').length)
  const pendingReports = computed(() => data.value.reports.filter(item => item.status === 'pending').length)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
    } catch {
      // 本地存储不可用时保留当前会话状态。
    }
  }

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      data.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(initialAdminData)) as AdminData
    } catch {
      data.value = cloneInitial()
    }
    initialized.value = true
  }

  function addPrimary(name: string, slug: string) {
    const clean = slug.trim().toLowerCase()
    if (!name.trim() || !clean) throw new Error('名称和 slug 不能为空。')
    if (data.value.categories.some(item => item.slug === clean)) throw new Error('同级 slug 必须唯一。')
    data.value.categories.push({ id: uid('cat'), name: name.trim(), slug: clean, enabled: true, novelCount: 0, children: [] })
    persist()
  }

  function addSecondary(parentId: string, name: string, slug: string) {
    const parent = data.value.categories.find(item => item.id === parentId)
    if (!parent) throw new Error('一级分类不存在。')
    const clean = slug.trim().toLowerCase()
    if (!name.trim() || !clean) throw new Error('名称和 slug 不能为空。')
    if (parent.children.some(item => item.slug === clean)) throw new Error('同级 slug 必须唯一。')
    parent.children.push({ id: uid('cat-secondary'), name: name.trim(), slug: clean, enabled: true, novelCount: 0 })
    persist()
  }

  function toggleCategory(id: string) {
    for (const primary of data.value.categories) {
      if (primary.id === id) {
        primary.enabled = !primary.enabled
        persist()
        return
      }
      const child = primary.children.find(item => item.id === id)
      if (child) {
        child.enabled = !child.enabled
        persist()
        return
      }
    }
  }

  function addTag(name: string, slug: string) {
    const clean = slug.trim().toLowerCase()
    if (!name.trim() || !clean) throw new Error('名称和 slug 不能为空。')
    if (data.value.tags.some(item => item.slug === clean)) throw new Error('标签 slug 必须唯一。')
    data.value.tags.push({ id: uid('tag'), name: name.trim(), slug: clean, enabled: true, novelCount: 0 })
    persist()
  }

  function toggleTag(id: string) {
    data.value.tags = data.value.tags.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    persist()
  }

  function saveFooterSettings(settings: Pick<FooterConfig, 'copyright' | 'secondaryText'>) {
    data.value.footer.copyright = settings.copyright.trim()
    data.value.footer.secondaryText = settings.secondaryText.trim()
    persist()
  }

  function addFooterLink(input: Omit<FooterLink, 'id'>) {
    if (!input.label.trim() || !input.url.trim()) throw new Error('链接名称和地址不能为空。')
    if (!isSafeFooterUrl(input.url.trim())) throw new Error('链接仅支持站内路径、HTTPS 或邮箱地址。')
    data.value.footer.links.push({ ...input, id: uid('footer-link'), label: input.label.trim(), url: input.url.trim() })
    persist()
  }

  function updateFooterLink(id: string, input: Omit<FooterLink, 'id'>) {
    if (!input.label.trim() || !input.url.trim()) throw new Error('链接名称和地址不能为空。')
    if (!isSafeFooterUrl(input.url.trim())) throw new Error('链接仅支持站内路径、HTTPS 或邮箱地址。')
    const index = data.value.footer.links.findIndex(item => item.id === id)
    if (index < 0) throw new Error('页脚链接不存在。')
    data.value.footer.links[index] = { ...input, id, label: input.label.trim(), url: input.url.trim() }
    persist()
  }

  function deleteFooterLink(id: string) {
    data.value.footer.links = data.value.footer.links.filter(item => item.id !== id)
    persist()
  }

  function toggleFooterLink(id: string) {
    data.value.footer.links = data.value.footer.links.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    persist()
  }

  function addDiscoveryItem(input: Omit<DiscoveryItem, 'id'>) {
    if (!input.label.trim() || !input.url.trim()) throw new Error('名称和链接不能为空。')
    if (!isSafeFooterUrl(input.url.trim())) throw new Error('链接仅支持站内路径、HTTPS 或邮箱地址。')
    data.value.discoveryItems.push({ ...input, id: uid('discovery'), label: input.label.trim(), url: input.url.trim() })
    persist()
  }

  function updateDiscoveryItem(id: string, input: Omit<DiscoveryItem, 'id'>) {
    if (!input.label.trim() || !input.url.trim()) throw new Error('名称和链接不能为空。')
    if (!isSafeFooterUrl(input.url.trim())) throw new Error('链接仅支持站内路径、HTTPS 或邮箱地址。')
    const index = data.value.discoveryItems.findIndex(item => item.id === id)
    if (index < 0) throw new Error('标签云条目不存在。')
    data.value.discoveryItems[index] = { ...input, id, label: input.label.trim(), url: input.url.trim() }
    persist()
  }

  function deleteDiscoveryItem(id: string) {
    data.value.discoveryItems = data.value.discoveryItems.filter(item => item.id !== id)
    persist()
  }

  function toggleDiscoveryItem(id: string) {
    data.value.discoveryItems = data.value.discoveryItems.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    persist()
  }

  function review(id: string, status: 'approved' | 'rejected') {
    data.value.reviews = data.value.reviews.map(item => item.id === id ? { ...item, status } : item)
    persist()
  }

  function resolveReport(id: string, status: 'resolved' | 'dismissed') {
    data.value.reports = data.value.reports.map(item => item.id === id ? { ...item, status } : item)
    persist()
  }

  function setBan(id: string, banned: boolean, reason?: string) {
    data.value.users = data.value.users.map(item => item.id === id
      ? { ...item, banned, banReason: banned ? reason?.trim() || '违反社区规范' : undefined }
      : item)
    persist()
  }

  return { data, initialized, pendingReviews, pendingReports, initialize, addPrimary, addSecondary, toggleCategory, addTag, toggleTag, saveFooterSettings, addFooterLink, updateFooterLink, deleteFooterLink, toggleFooterLink, addDiscoveryItem, updateDiscoveryItem, deleteDiscoveryItem, toggleDiscoveryItem, review, resolveReport, setBan }
})

import type { Category } from './novel'

export interface AdminTag { id: string, name: string, slug: string, enabled: boolean, novelCount: number }
export interface ReviewItem { id: string, type: 'novel' | 'chapter', title: string, authorName: string, submittedAt: string, status: 'pending' | 'approved' | 'rejected' }
export interface ReportItem { id: string, targetType: 'comment' | 'reply' | 'novel', targetSummary: string, reporterName: string, reason: string, createdAt: string, status: 'pending' | 'resolved' | 'dismissed' }
export interface AdminUser { id: string, name: string, role: 'reader' | 'author', joinedAt: string, banned: boolean, banReason?: string }
export interface FooterLink { id: string, label: string, url: string, order: number, enabled: boolean }
export interface FooterConfig { copyright: string, secondaryText: string, links: FooterLink[] }
export type DiscoveryItemType = 'author' | 'category' | 'tag'
export interface DiscoveryItem { id: string, label: string, url: string, type: DiscoveryItemType, emphasis: 1 | 2 | 3, order: number, enabled: boolean }
export interface AdminData { categories: Category[], tags: AdminTag[], reviews: ReviewItem[], reports: ReportItem[], users: AdminUser[], footer: FooterConfig, discoveryItems: DiscoveryItem[] }

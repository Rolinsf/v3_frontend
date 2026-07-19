// 用户摘要：用于评论作者、作品作者、书架归属等场景。
// 完整用户资料（账户安全、通知设置等）属于阶段 4+ 范围，不在此定义。

export type UserRole = 'reader' | 'author' | 'admin'

export interface UserSummary {
  id: string
  name: string
  /** 头像 URL；为空时由前端使用首字母占位。 */
  avatarUrl?: string
  /** 简短签名，显示在作者主页和评论卡片。 */
  bio?: string
  role: UserRole
}

/** 公开主页可展示的资料；不包含联系方式、账户设置或阅读数据。 */
export interface PublicUserProfile extends UserSummary {
  joinedAt: string
}

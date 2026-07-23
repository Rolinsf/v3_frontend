<script setup lang="ts">
import type { BookshelfStatus } from '~/types/bookshelf'
import type { ReadingProgress } from '~/types/reader'
import { BOOKSHELF_STATUS_LABELS } from '~/types/bookshelf'

definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '我的｜若林轻小说', description: '统一管理个人资料、作品、评论和阅读数据。' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const creator = useCreatorStore()
const commentsStore = useCommentsStore()
const bookshelf = useBookshelfStore()
const readingProgress = useReadingProgressStore()
const { data: novels, pending: novelsPending } = useNovelList()
const section = computed(() => typeof route.query.section === 'string' ? route.query.section : 'overview')
const readingView = computed(() => route.query.view === 'history' ? 'history' : 'bookshelf')
const name = ref(auth.user?.name ?? '')
const avatarUrl = ref(auth.user?.avatarUrl ?? '')
const saved = ref(false)
const activeShelfStatus = ref<BookshelfStatus>('reading')
const ownedNovels = creator.ownedNovels(auth.user?.id ?? '')
const myComments = commentsStore.myEntries(auth.user?.id ?? '')
const shelfTabs = (Object.keys(BOOKSHELF_STATUS_LABELS) as BookshelfStatus[]).map(value => ({
  value,
  label: BOOKSHELF_STATUS_LABELS[value]
}))
const visibleShelfItems = computed(() => bookshelf.items
  .filter(item => item.status === activeShelfStatus.value)
  .map(item => ({ shelf: item, novel: novels.value?.find(novel => novel.id === item.novelId) }))
  .filter(entry => entry.novel))
const historyEntries = computed(() => readingProgress.progressList.map(progress => ({
  progress,
  novel: novels.value?.find(novel => novel.id === progress.novelId)
})).filter(entry => entry.novel))
const contributions = computed(() => {
  const days = new Map<string, number>()
  for (const novel of ownedNovels.value) {
    const dates = [novel.createdAt, novel.updatedAt]
    for (const volume of novel.volumes) {
      for (const chapter of volume.chapters) {
        if (chapter.status === 'published' && chapter.publishedAt) dates.push(chapter.publishedAt)
      }
    }
    for (const value of dates) {
      const date = value.slice(0, 10)
      days.set(date, (days.get(date) ?? 0) + 1)
    }
  }
  return [...days].map(([date, count]) => ({ date, count }))
})

const navigation = [
  { id: 'overview', label: '账户概览', icon: 'i-lucide-layout-dashboard' },
  { id: 'profile', label: '个人信息', icon: 'i-lucide-user-round' },
  { id: 'works', label: '我的作品', icon: 'i-lucide-book-open' },
  { id: 'comments', label: '我的评论', icon: 'i-lucide-message-circle' },
  { id: 'reading', label: '阅读管理', icon: 'i-lucide-bookmark' },
  { id: 'notifications', label: '通知中心', icon: 'i-lucide-bell' },
  { id: 'security', label: '账户安全', icon: 'i-lucide-shield-check' }
]

function selectSection(id: string) {
  router.replace({ query: id === 'overview' ? {} : { section: id } })
}

function selectReadingView(view: 'bookshelf' | 'history') {
  router.replace({ query: { section: 'reading', ...(view === 'history' ? { view } : {}) } })
}

function saveProfile() {
  auth.updateProfile({ name: name.value, avatarUrl: avatarUrl.value })
  saved.value = true
  setTimeout(() => { saved.value = false }, 1800)
}

function words(novel: typeof ownedNovels.value[number]) {
  return novel.volumes.flatMap(volume => volume.chapters).reduce((sum, chapter) => sum + chapter.plainText.length, 0)
}

function targetTo(comment: { targetType: 'novel' | 'chapter', targetId: string, novelId?: string }) {
  if (comment.targetType === 'novel') return `/novels/${comment.targetId}`
  return comment.novelId ? `/novels/${comment.novelId}/chapters/${comment.targetId}` : '/novels'
}

function removeComment(commentId: string, replyId?: string) {
  if (!auth.user || !import.meta.client || !window.confirm('确定删除这条内容吗？')) return
  commentsStore.deleteEntry(commentId, auth.user.id, replyId)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function progressPercent(progress: ReadingProgress) {
  return Math.round(Math.min(1, Math.max(0, progress.scrollRatio)) * 100)
}
</script>

<template>
  <main class="account-page">
    <div class="site-container account-layout">
      <aside class="account-sidebar">
        <div class="account-identity">
          <span class="account-avatar">{{ auth.user?.name.slice(0, 1) }}</span>
          <div><strong>{{ auth.user?.name }}</strong><small>{{ auth.user?.role === 'admin' ? '管理员' : '若林用户' }}</small></div>
        </div>
        <nav aria-label="我的功能">
          <button
            v-for="item in navigation"
            :key="item.id"
            :class="{ active: section === item.id }"
            @click="selectSection(item.id)"
          >
            <UIcon :name="item.icon" />{{ item.label }}
          </button>
        </nav>
      </aside>

      <section class="account-content">
        <template v-if="section === 'overview'">
          <header><p>MY ACCOUNT</p><h1>我的</h1><span>集中管理你的创作、互动与阅读记录。</span></header>
          <UserContributionCalendar
            :contributions="contributions"
            title="创作贡献"
          />
          <div class="account-stats">
            <article><strong>{{ ownedNovels.length }}</strong><span>我的作品</span></article><article><strong>{{ myComments.length }}</strong><span>评论与回复</span></article><article><strong>{{ bookshelf.items.length }}</strong><span>书架收藏</span></article><article><strong>{{ commentsStore.notifications.length }}</strong><span>通知消息</span></article>
          </div>
          <div class="account-shortcuts">
            <button @click="selectSection('profile')">
              <UIcon name="i-lucide-user-round" /><span>完善个人信息</span>
            </button><button @click="selectSection('works')"><UIcon name="i-lucide-pen-line" /><span>管理我的创作</span></button><NuxtLink to="/events/new"><UIcon name="i-lucide-calendar-plus" /><span>发起社区活动</span></NuxtLink>
          </div>
        </template>

        <template v-else-if="section === 'profile'">
          <header><h1>个人信息</h1><span>修改公开昵称和头像地址。</span></header><form
            class="profile-form"
            @submit.prevent="saveProfile"
          >
            <label>昵称<UInput v-model="name" /></label><label>头像地址<UInput
              v-model="avatarUrl"
              placeholder="https://…"
            /></label><div>
              <UButton
                type="submit"
                label="保存修改"
              /><span v-if="saved">已保存</span>
            </div>
          </form>
        </template>

        <template v-else-if="section === 'works'">
          <header><h1>我的作品</h1><span>管理小说资料、卷章和草稿。</span></header><div class="section-actions">
            <UButton
              to="/creator/novels/new"
              label="创建作品"
              icon="i-lucide-plus"
            /><UButton
              to="/creator/drafts"
              label="草稿箱"
              icon="i-lucide-files"
              color="neutral"
              variant="outline"
            />
          </div><div
            v-if="ownedNovels.length"
            class="work-list"
          >
            <article
              v-for="novel in ownedNovels"
              :key="novel.id"
            >
              <div class="work-cover">
                <img
                  v-if="novel.coverDataUrl"
                  :src="novel.coverDataUrl"
                  :alt="`${novel.title}封面`"
                ><UIcon
                  v-else
                  name="i-lucide-book-open"
                />
              </div>
              <div class="work-info"><strong>{{ novel.title }}</strong><span>{{ novel.status === 'draft' ? '草稿' : novel.status === 'serializing' ? '连载中' : '已完结' }} · {{ words(novel).toLocaleString('zh-CN') }} 字 · {{ novel.volumes.length }} 卷</span></div>
              <div class="work-actions">
                <UButton
                  :to="`/creator/novels/${novel.id}/chapters`"
                  label="管理卷章"
                  size="sm"
                  variant="outline"
                /><UButton
                  :to="`/creator/novels/${novel.id}/edit`"
                  label="编辑资料"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                />
              </div>
            </article>
          </div><EmptyState
            v-else
            icon="i-lucide-book-plus"
            title="还没有作品"
            description="从一个名字开始，写下你的第一部小说。"
          />
        </template>

        <template v-else-if="section === 'comments'">
          <header><h1>我的评论</h1><span>查看和管理你发表的评论与回复，共 {{ myComments.length }} 条记录。</span></header>
          <EmptyState
            v-if="myComments.length === 0"
            icon="i-lucide-message-circle"
            title="还没有发表过评论"
            description="去书库发现故事，留下你的第一条评论。"
            action-label="去书库看看"
            action-to="/novels"
          />
          <div
            v-else
            class="activity-list"
          >
            <article
              v-for="entry in myComments"
              :key="entry.reply?.id ?? entry.comment.id"
            >
              <div class="item-meta"><span>{{ entry.reply ? '回复' : entry.comment.targetType === 'novel' ? '作品评论' : '章节评论' }}</span><time>{{ formatDate(entry.reply?.createdAt ?? entry.comment.createdAt) }}</time></div>
              <p>{{ entry.reply?.content ?? entry.comment.content }}</p>
              <div class="item-actions"><UButton
                :to="targetTo(entry.comment)"
                label="查看原文"
                size="sm"
                color="neutral"
                variant="outline"
              /><UButton
                label="删除"
                icon="i-lucide-trash-2"
                size="sm"
                color="error"
                variant="ghost"
                @click="removeComment(entry.comment.id, entry.reply?.id)"
              /></div>
            </article>
          </div>
        </template>

        <template v-else-if="section === 'reading'">
          <header><h1>阅读管理</h1><span>我的书架与阅读历史都在这里。</span></header>
          <div class="subsection-tabs">
            <button
              :class="{ active: readingView === 'bookshelf' }"
              @click="selectReadingView('bookshelf')"
            >我的书架</button>
            <button
              :class="{ active: readingView === 'history' }"
              @click="selectReadingView('history')"
            >阅读历史</button>
          </div>
          <template v-if="readingView === 'bookshelf'">
            <nav
              class="filter-tabs"
              aria-label="书架分类"
            >
              <button
                v-for="tab in shelfTabs"
                :key="tab.value"
                :class="{ active: activeShelfStatus === tab.value }"
                @click="activeShelfStatus = tab.value"
              >{{ tab.label }} <span>{{ bookshelf.items.filter(item => item.status === tab.value).length }}</span></button>
            </nav>
            <LoadingSkeleton v-if="novelsPending" />
            <EmptyState
              v-else-if="visibleShelfItems.length === 0"
              icon="i-lucide-bookmark"
              :title="`${BOOKSHELF_STATUS_LABELS[activeShelfStatus]}里还没有作品`"
              description="从书库或作品详情页加入一本小说吧。"
              action-label="浏览书库"
              action-to="/novels"
            />
            <div
              v-else
              class="reading-list"
            >
              <article
                v-for="entry in visibleShelfItems"
                :key="entry.shelf.novelId"
              >
                <NovelCover
                  :title="entry.novel!.title"
                  :tone="entry.novel!.coverTone"
                />
                <div><NuxtLink :to="`/novels/${entry.novel!.id}`"><strong>{{ entry.novel!.title }}</strong></NuxtLink><span>{{ entry.novel!.author.name }} · {{ entry.novel!.latestChapter.title }}</span></div>
                <div class="item-actions"><select
                  :value="entry.shelf.status"
                  aria-label="调整阅读状态"
                  @change="bookshelf.updateStatus(entry.shelf.novelId, ($event.target as HTMLSelectElement).value as BookshelfStatus)"
                ><option
                  v-for="tab in shelfTabs"
                  :key="tab.value"
                  :value="tab.value"
                >{{ tab.label }}</option></select><UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  aria-label="移出书架"
                  @click="bookshelf.remove(entry.shelf.novelId)"
                /></div>
              </article>
            </div>
          </template>
          <template v-else>
            <EmptyState
              v-if="historyEntries.length === 0"
              icon="i-lucide-history"
              title="还没有阅读足迹"
              description="打开任意公开章节后，阅读位置会保存在这里。"
              action-label="去书库找故事"
              action-to="/novels"
            />
            <div
              v-else
              class="reading-list history-list"
            >
              <article
                v-for="entry in historyEntries"
                :key="entry.progress.novelId"
              >
                <div class="history-icon"><UIcon name="i-lucide-history" /></div>
                <div><strong>{{ entry.novel!.title }}</strong><span>{{ entry.progress.chapterTitle ?? `章节 ${entry.progress.chapterId}` }} · 本章 {{ progressPercent(entry.progress) }}%</span></div>
                <div class="item-actions"><UButton
                  :to="`/novels/${entry.progress.novelId}/chapters/${entry.progress.chapterId}`"
                  label="继续阅读"
                  size="sm"
                  variant="outline"
                /><UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  aria-label="删除阅读记录"
                  @click="readingProgress.clearProgress(entry.progress.novelId)"
                /></div>
              </article>
            </div>
          </template>
        </template>

        <template v-else-if="section === 'notifications'">
          <header class="section-heading"><div><h1>通知中心</h1><span>回复、点赞、作品更新和系统通知，当前 {{ commentsStore.unreadCount }} 条未读。</span></div><UButton
            v-if="commentsStore.unreadCount"
            label="全部标为已读"
            color="neutral"
            variant="ghost"
            @click="commentsStore.markAllRead"
          />
          </header>
          <EmptyState
            v-if="commentsStore.notifications.length === 0"
            icon="i-lucide-bell"
            title="暂时没有通知"
            description="有新的互动时，我们会安静地放在这里。"
          />
          <div
            v-else
            class="notification-list"
          >
            <NuxtLink
              v-for="item in commentsStore.notifications"
              :key="item.id"
              :to="item.to || '/account?section=notifications'"
              :class="{ unread: !item.read }"
            >
              <span class="notification-icon"><UIcon :name="item.type === 'reply' ? 'i-lucide-reply' : item.type === 'like' ? 'i-lucide-heart' : 'i-lucide-shield-check'" /></span>
              <div><strong>{{ item.title }}</strong><p>{{ item.description }}</p><time>{{ formatDate(item.createdAt) }}</time></div><i v-if="!item.read" />
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <header><h1>账户安全</h1><span>管理登录状态和账户安全。</span></header><div class="security-card">
            <UIcon name="i-lucide-shield-check" /><div><strong>当前账户已登录</strong><p>{{ auth.user?.identifier }}</p></div>
          </div><p class="section-summary">
            当前为前端 Mock 认证阶段；正式后端接入后将在这里提供密码修改、登录设备和会话管理。
          </p>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.account-page{padding:2rem 0 5rem}.account-layout{display:grid;grid-template-columns:14rem minmax(0,1fr);gap:2rem;align-items:start}.account-sidebar{position:sticky;top:calc(var(--site-header-height) + 1rem);padding:1rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-identity{display:flex;align-items:center;gap:.7rem;padding:.4rem .35rem 1rem;border-bottom:1px solid var(--site-line)}.account-avatar{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-100);color:var(--color-brand-800);font-weight:600}.account-identity strong,.account-identity small{display:block}.account-identity small{margin-top:.15rem;color:var(--site-muted);font-size:.68rem}.account-sidebar nav{display:grid;gap:.2rem;margin-top:.75rem}.account-sidebar button{display:flex;align-items:center;gap:.6rem;width:100%;padding:.6rem .7rem;border-radius:.5rem;color:var(--site-muted);font-size:.82rem;text-align:left}.account-sidebar button:hover,.account-sidebar button.active{background:var(--color-brand-50);color:var(--color-brand-800)}.account-content{min-height:32rem;padding:1.5rem;border:1px solid var(--site-line);border-radius:.9rem;background:var(--site-surface)}.account-content header{padding-bottom:1rem;border-bottom:1px solid var(--site-line)}.account-content header>p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.account-content h1{margin:.25rem 0;font-family:var(--font-reading);font-size:2rem;font-weight:600}.account-content header>span,.section-heading span,.section-summary{color:var(--site-muted);font-size:.78rem}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:1rem}.account-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-top:1.25rem}.account-stats article{padding:1rem;border:1px solid var(--site-line);border-radius:.65rem}.account-stats strong,.account-stats span{display:block}.account-stats strong{font-size:1.5rem}.account-stats span{margin-top:.25rem;color:var(--site-muted);font-size:.72rem}.account-shortcuts{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1.25rem}.account-shortcuts a,.account-shortcuts button{display:flex;align-items:center;gap:.6rem;padding:1rem;border:1px solid var(--site-line);border-radius:.65rem;color:inherit}.profile-form{display:grid;gap:1rem;max-width:34rem;margin-top:1.25rem}.profile-form label{display:grid;gap:.4rem;font-size:.78rem}.profile-form>div{display:flex;align-items:center;gap:.7rem}.profile-form>div span{color:var(--color-brand-700);font-size:.72rem}.section-actions,.item-actions{display:flex;gap:.5rem}.section-actions{margin:1.25rem 0}.work-list,.activity-list,.notification-list{display:grid}.work-list article{display:grid;grid-template-columns:3.5rem minmax(0,1fr) auto;gap:.8rem;align-items:center;padding:.9rem 0;border-bottom:1px solid var(--site-line)}.work-cover{display:grid;place-items:center;aspect-ratio:3/4;overflow:hidden;border-radius:.4rem;background:var(--color-brand-100);color:var(--color-brand-700)}.work-cover img{width:100%;height:100%;object-fit:cover}.work-info span{display:block;margin-top:.2rem;color:var(--site-muted);font-size:.7rem}.work-actions{display:flex;gap:.3rem}.activity-list article{padding:1.1rem 0;border-bottom:1px solid var(--site-line)}.activity-list article>p{margin:.55rem 0 .8rem;font-size:.84rem;line-height:1.7}.item-meta{display:flex;gap:.6rem;color:var(--site-muted);font-size:.68rem}.subsection-tabs,.filter-tabs{display:flex;gap:1.2rem;border-bottom:1px solid var(--site-line)}.subsection-tabs{margin-top:1.2rem}.subsection-tabs button,.filter-tabs button{padding:.7rem .1rem;border-bottom:2px solid transparent;color:var(--site-muted);font-size:.8rem}.subsection-tabs button.active,.filter-tabs button.active{border-color:var(--color-brand-600);color:var(--site-ink)}.filter-tabs{margin:1rem 0}.filter-tabs span{font-size:.68rem}.reading-list article{display:grid;grid-template-columns:3.5rem minmax(0,1fr) auto;gap:.9rem;align-items:center;padding:1rem 0;border-bottom:1px solid var(--site-line)}.reading-list :deep(.novel-cover){width:3.5rem}.reading-list article>div:nth-child(2) span{display:block;margin-top:.25rem;color:var(--site-muted);font-size:.7rem}.item-actions{align-items:center}.item-actions select{padding:.35rem;border:1px solid var(--site-line);border-radius:.4rem;background:var(--site-surface);font-size:.7rem}.history-icon{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-brand-50);color:var(--color-brand-700)}.notification-list>a{display:grid;grid-template-columns:2.5rem minmax(0,1fr) auto;gap:.8rem;padding:1rem 0;border-bottom:1px solid var(--site-line)}.notification-icon{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--site-surface);color:var(--site-muted)}.notification-list>a.unread .notification-icon{background:var(--color-brand-100);color:var(--color-brand-700)}.notification-list p,.notification-list time{color:var(--site-muted);font-size:.72rem}.notification-list>a>i{width:.4rem;height:.4rem;margin-top:.5rem;border-radius:50%;background:var(--color-brand-500)}.section-summary{margin:1.25rem 0}.security-card{display:flex;align-items:center;gap:1rem;margin-top:1.25rem;padding:1rem;border:1px solid var(--color-brand-200);border-radius:.65rem;background:var(--color-brand-50)}.security-card>svg{font-size:1.5rem;color:var(--color-brand-700)}.security-card p{color:var(--site-muted);font-size:.72rem}@media(max-width:800px){.account-layout{grid-template-columns:1fr}.account-sidebar{position:static;overflow-x:auto}.account-identity{display:none}.account-sidebar nav{display:flex;margin:0}.account-sidebar button{width:auto;white-space:nowrap}.account-stats{grid-template-columns:repeat(2,1fr)}.account-shortcuts{grid-template-columns:1fr}.work-list article,.reading-list article{grid-template-columns:3.5rem minmax(0,1fr)}.work-actions,.reading-list .item-actions{grid-column:2;flex-wrap:wrap}.section-heading{align-items:flex-start;flex-direction:column}}
</style>

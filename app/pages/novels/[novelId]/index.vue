<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const novelId = computed(() => String(route.params.novelId))
const { data: novel, error, refresh } = useNovelDetail(novelId)
// 已读状态：访客在本地 localStorage；阶段 4 登录后会与服务端进度合并。
const { isChapterRead } = useReadingProgress()
const { getStatus: getBookshelfStatus, add: addToBookshelf, remove: removeFromBookshelf } = useBookshelf()
const bookshelfStatus = computed(() => getBookshelfStatus(novelId.value))

function toggleBookshelf() {
  if (!auth.user) {
    auth.saveIntent({ redirect: route.fullPath, action: 'bookshelf', targetId: novelId.value })
    navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (bookshelfStatus.value) removeFromBookshelf(novelId.value)
  else addToBookshelf(novelId.value, 'reading')
}

onMounted(() => {
  const intent = auth.peekResumedIntent()
  if (intent?.action === 'bookshelf' && intent.targetId === novelId.value) {
    auth.clearResumedIntent()
    if (!bookshelfStatus.value) addToBookshelf(novelId.value, 'reading')
  }
})

// useNovelDetail 在未命中时抛 createError(404)，Nuxt 会自动渲染错误页；
// 这里仅处理 SEO 与页面级状态，不再手动 throw。
useSeoMeta({
  title: () => novel.value ? `${novel.value.title}｜若林轻小说` : '若林轻小说',
  description: () => novel.value?.synopsis ?? '',
  ogTitle: () => novel.value?.title ?? '',
  ogDescription: () => novel.value?.synopsis ?? '',
  ogType: 'book'
})

const reversed = ref(false)
// 简介超过阈值时折叠，点击可展开；避免长简介挤占作品入口。
const SYNOPSIS_CLAMP_THRESHOLD = 120
const synopsisExpanded = ref(false)
const synopsisShouldClamp = computed(() => (novel.value?.synopsis.length ?? 0) > SYNOPSIS_CLAMP_THRESHOLD)
const volumes = computed(() => {
  if (!novel.value) return []
  return reversed.value ? [...novel.value.volumes].reverse() : novel.value.volumes
})
const firstChapter = computed(() => novel.value?.volumes[0]?.chapters[0])
const totalChapters = computed(() => novel.value?.volumes.reduce((sum, volume) => sum + volume.chapters.length, 0) ?? 0)
</script>

<template>
  <div class="novel-detail-page">
    <div class="site-container">
      <ErrorState
        v-if="error"
        :description="error.statusMessage || '无法加载作品详情，请稍后重试。'"
        @retry="refresh()"
      />
      <template v-else-if="novel">
        <nav
          class="breadcrumbs"
          aria-label="面包屑"
        >
          <NuxtLink to="/">首页</NuxtLink><UIcon name="i-lucide-chevron-right" /><NuxtLink to="/novels">书库</NuxtLink><UIcon name="i-lucide-chevron-right" /><span>{{ novel.title }}</span>
        </nav>

        <section class="novel-detail-hero">
          <NovelCover
            :title="novel.title"
            :tone="novel.coverTone"
          />
          <div class="novel-detail-hero__content">
            <p class="novel-detail-hero__category">
              {{ novel.category.primary }} / {{ novel.category.secondary }}
            </p>
            <h1>{{ novel.title }}</h1>
            <p class="novel-detail-hero__meta">
              <NuxtLink :to="`/users/${novel.author.id}`">{{ novel.author.name }}</NuxtLink><span>·</span><span>{{ novel.status === 'serializing' ? '连载中' : '已完结' }}</span><span>·</span><span>{{ (novel.wordCount / 10000).toFixed(1) }} 万字</span>
            </p>
            <div class="novel-tags">
              <span
                v-for="tag in novel.tags"
                :key="tag.id"
              >{{ tag.name }}</span>
            </div>
            <p
              class="novel-detail-hero__synopsis"
              :class="{ 'is-clamped': synopsisShouldClamp && !synopsisExpanded }"
            >
              {{ novel.synopsis }}
            </p>
            <UButton
              v-if="synopsisShouldClamp"
              :label="synopsisExpanded ? '收起' : '展开简介'"
              :icon="synopsisExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              color="neutral"
              variant="ghost"
              size="xs"
              class="novel-detail-hero__synopsis-toggle"
              @click="synopsisExpanded = !synopsisExpanded"
            />
            <div class="novel-detail-hero__actions">
              <UButton
                v-if="firstChapter"
                :to="`/novels/${novel.id}/chapters/${firstChapter.id}`"
                label="开始阅读"
                size="lg"
                icon="i-lucide-book-open"
              />
              <UButton
                :label="bookshelfStatus ? '移出书架' : '加入书架'"
                size="lg"
                color="neutral"
                variant="outline"
                :icon="bookshelfStatus ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark-plus'"
                @click="toggleBookshelf"
              />
              <UButton
                icon="i-lucide-share-2"
                size="lg"
                color="neutral"
                variant="ghost"
                aria-label="分享作品"
              />
            </div>
            <p class="novel-detail-hero__count">
              已有 {{ novel.bookshelfCount.toLocaleString('zh-CN') }} 位读者收藏
            </p>
          </div>
        </section>

        <aside
          v-if="novel.announcement"
          class="novel-announcement"
        >
          <UIcon name="i-lucide-megaphone" /><div><strong>作品公告</strong><p>{{ novel.announcement }}</p></div>
        </aside>

        <section class="catalog-section">
          <div class="section-title-row">
            <div>
              <h2>作品目录</h2>
              <p>共 {{ totalChapters }} 章</p>
            </div>
            <UButton
              :label="reversed ? '倒序' : '正序'"
              :icon="reversed ? 'i-lucide-arrow-down-wide-narrow' : 'i-lucide-arrow-up-narrow-wide'"
              color="neutral"
              variant="ghost"
              @click="reversed = !reversed"
            />
          </div>
          <div class="volume-list">
            <section
              v-for="volume in volumes"
              :key="volume.id"
              class="volume-block"
            >
              <div class="volume-block__header">
                <div>
                  <h3>{{ volume.title }}</h3>
                  <p v-if="volume.description">
                    {{ volume.description }}
                  </p>
                </div><span>{{ volume.chapters.length }} 章</span>
              </div>
              <NuxtLink
                v-for="chapter in (reversed ? [...volume.chapters].reverse() : volume.chapters)"
                :key="chapter.id"
                :to="`/novels/${novel.id}/chapters/${chapter.id}`"
                class="chapter-row"
                :class="{
                  'is-read': !chapter.isLocked && isChapterRead(novel.id, chapter.id),
                  'is-locked': chapter.isLocked
                }"
              >
                <span class="chapter-row__title">
                  <UIcon
                    v-if="chapter.isLocked"
                    name="i-lucide-lock"
                    class="chapter-row__icon chapter-row__icon--locked"
                    aria-label="锁定章节"
                  />
                  <UIcon
                    v-else-if="isChapterRead(novel.id, chapter.id)"
                    name="i-lucide-check"
                    class="chapter-row__icon chapter-row__icon--read"
                    aria-label="已读"
                  />
                  {{ chapter.title }}
                </span><span class="chapter-row__meta">{{ chapter.wordCount.toLocaleString('zh-CN') }} 字 <em v-if="chapter.isLatest">最新</em><em v-else-if="chapter.isLocked">锁定</em><em v-else-if="isChapterRead(novel.id, chapter.id)">已读</em></span>
              </NuxtLink>
            </section>
          </div>
        </section>

        <CommentCommentSection
          target-type="novel"
          :target-id="novel.id"
          title="作品评论"
        />
      </template>
    </div>
  </div>
</template>

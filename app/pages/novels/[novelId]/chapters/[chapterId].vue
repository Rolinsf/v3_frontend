<script setup lang="ts">
definePageMeta({ layout: 'reader' })

const route = useRoute()
const novelId = computed(() => String(route.params.novelId))
const chapterId = computed(() => String(route.params.chapterId))

const { data: chapter, error, refresh } = useChapter(novelId, chapterId)
// 章节目录：从作品详情派生，替换原页面散落的硬编码列表。
const { data: novel } = useNovelDetail(novelId)
const { saveProgress } = useReadingProgress()
const config = useRuntimeConfig()

// useChapter 在未命中时已抛 createError(404)；这里只在 SEO 和页面状态层处理。
useSeoMeta({
  title: () => chapter.value ? `${chapter.value.title} - ${chapter.value.novelTitle}｜若林轻小说` : '若林轻小说',
  description: () => chapter.value ? `${chapter.value.novelTitle} ${chapter.value.title}，在线阅读全文。` : '',
  ogTitle: () => chapter.value ? `${chapter.value.title} - ${chapter.value.novelTitle}` : '',
  ogDescription: () => chapter.value?.novelTitle ?? '',
  ogType: 'article',
  ogUrl: () => chapter.value ? `${config.public.siteUrl}/novels/${chapter.value.novelId}/chapters/${chapter.value.id}` : '',
  twitterCard: 'summary'
})

const settingsOpen = ref(false)
const catalogOpen = ref(false)
const toolbarVisible = ref(true)
const { theme, font, readerStyle } = useReader()

// 扁平化章节列表，供目录抽屉与键盘翻页使用。
const flatChapters = computed(() => {
  if (!novel.value) return []
  return novel.value.volumes.flatMap(volume => volume.chapters)
})

const currentIndex = computed(() => flatChapters.value.findIndex(c => c.id === chapterId.value))
const previousChapterId = computed(() => currentIndex.value > 0 ? flatChapters.value[currentIndex.value - 1]?.id : undefined)
const nextChapterId = computed(() => {
  const next = flatChapters.value[currentIndex.value + 1]
  return next?.id
})

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft' && previousChapterId.value) {
    navigateTo(`/novels/${novelId.value}/chapters/${previousChapterId.value}`)
  }
  if (event.key === 'ArrowRight' && nextChapterId.value) {
    navigateTo(`/novels/${novelId.value}/chapters/${nextChapterId.value}`)
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // 访客阅读进度：进入章节时记录 novelId + chapterId 到 localStorage。
  // 阅读位置（scrollRatio）暂记为 0，阶段 4 可在滚动时增量更新。
  if (chapter.value) {
    saveProgress({
      novelId: chapter.value.novelId,
      chapterId: chapter.value.id,
      chapterTitle: chapter.value.title,
      scrollRatio: 0,
      readAt: new Date().toISOString()
    })
  }
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div
    class="reader-page"
    :class="[`reader-theme--${theme}`, `reader-font--${font}`]"
    :style="readerStyle"
  >
    <header
      class="reader-toolbar"
      :class="{ 'is-hidden': !toolbarVisible }"
    >
      <div class="reader-toolbar__inner">
        <UButton
          :to="`/novels/${novelId}`"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          :label="chapter?.novelTitle ?? '返回作品'"
          class="reader-toolbar__back"
        />
        <p>{{ chapter?.title }}</p>
        <div>
          <UButton
            icon="i-lucide-list"
            color="neutral"
            variant="ghost"
            aria-label="章节目录"
            @click="catalogOpen = true"
          />
          <UButton
            icon="i-lucide-settings-2"
            color="neutral"
            variant="ghost"
            aria-label="阅读设置"
            @click="settingsOpen = true"
          />
        </div>
      </div>
    </header>

    <main
      class="reader-main"
      @click.self="toolbarVisible = !toolbarVisible"
    >
      <ErrorState
        v-if="error"
        :description="error.statusMessage || '无法加载章节内容，请稍后重试。'"
        @retry="refresh()"
      />
      <article
        v-else-if="chapter"
        class="reader-article"
      >
        <header class="reader-article__header">
          <NuxtLink :to="`/novels/${chapter.novelId}`">{{ chapter.novelTitle }} · {{ chapter.volumeTitle }}</NuxtLink>
          <h1>{{ chapter.title }}</h1>
          <p>
            <time :datetime="chapter.publishedAt">发布于 {{ formatDate(chapter.publishedAt) }}</time><span>·</span><span>{{ chapter.wordCount.toLocaleString('zh-CN') }} 字</span>
          </p>
        </header>
        <div class="reader-content">
          <p
            v-for="(paragraph, index) in chapter.paragraphs"
            :key="index"
          >
            {{ paragraph }}
          </p>
        </div>
        <aside
          v-if="chapter.authorNote"
          class="author-note"
        >
          <p>作者的话</p><div>{{ chapter.authorNote }}</div>
        </aside>
        <CommentCommentSection
          target-type="chapter"
          :target-id="chapter.id"
          :novel-id="chapter.novelId"
          title="章节评论"
        />
        <nav
          class="chapter-navigation"
          aria-label="章节导航"
        >
          <UButton
            v-if="previousChapterId"
            :to="`/novels/${chapter.novelId}/chapters/${previousChapterId}`"
            label="上一章"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="outline"
          />
          <span v-else />
          <UButton
            :to="`/novels/${chapter.novelId}`"
            label="目录"
            icon="i-lucide-list"
            color="neutral"
            variant="ghost"
          />
          <UButton
            v-if="nextChapterId"
            :to="`/novels/${chapter.novelId}/chapters/${nextChapterId}`"
            label="下一章"
            trailing-icon="i-lucide-arrow-right"
          />
          <span v-else />
        </nav>
      </article>
    </main>

    <USlideover
      v-model:open="settingsOpen"
      title="阅读设置"
      description="调整后的设置会保存在当前浏览器。"
    >
      <template #body>
        <ReaderReaderSettings />
      </template>
    </USlideover>
    <USlideover
      v-model:open="catalogOpen"
      title="章节目录"
      :description="novel?.volumes[0]?.title"
    >
      <template #body>
        <div class="reader-catalog">
          <template
            v-for="volume in novel?.volumes ?? []"
            :key="volume.id"
          >
            <NuxtLink
              v-for="item in volume.chapters"
              :key="item.id"
              :to="`/novels/${novelId}/chapters/${item.id}`"
              :class="{ 'is-active': item.id === chapterId }"
              @click="catalogOpen = false"
            >{{ item.title }}</NuxtLink>
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

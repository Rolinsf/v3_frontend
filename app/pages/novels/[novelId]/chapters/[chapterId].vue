<script setup lang="ts">
definePageMeta({ layout: 'reader' })

const route = useRoute()
const novelId = computed(() => String(route.params.novelId))
const chapterId = computed(() => String(route.params.chapterId))

const { data: chapter, error, refresh } = useChapter(novelId, chapterId)
// 章节目录：从作品详情派生，替换原页面散落的硬编码列表。
const { data: novel } = useNovelDetail(novelId)
const following = useFollowingStore()
const { isChapterRead } = useReadingProgress()
const config = useRuntimeConfig()
const toast = useToast()

watch(novel, (value) => {
  if (value) following.markUpdateSeen(value.id, value.updatedAt)
}, { immediate: true })

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
const { theme, font, autoAdvance, readerStyle } = useReader()
const { contentElement, readingRatio, resumeRatio, resumeNoticeVisible, previousChapterId, nextChapterId, scrollToRatio } = useChapterReading({
  chapter,
  novel,
  novelId,
  chapterId,
  autoAdvance
})

async function copyChapter() {
  if (!chapter.value) return
  const selected = window.getSelection()?.toString().trim()
  const text = selected || `${chapter.value.title}\n\n${chapter.value.paragraphs.join('\n\n')}`
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: selected ? '已复制选中文字' : '已复制本章正文', color: 'success' })
  } catch {
    toast.add({ title: '复制失败，请手动选择文字复制', color: 'error' })
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div
    class="reader-page"
    :class="[`reader-theme--${theme}`, `reader-font--${font}`]"
    :style="readerStyle"
  >
    <div
      class="reading-progress"
      role="progressbar"
      aria-label="本章阅读进度"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(readingRatio * 100)"
    >
      <i :style="{ width: `${readingRatio * 100}%` }" />
    </div>
    <ReaderToolbar
      :novel-id="novelId"
      :title="chapter?.title"
      :novel-title="chapter?.novelTitle"
      :visible="toolbarVisible"
      :progress="readingRatio"
      :previous="previousChapterId"
      :next="nextChapterId"
      @catalog="catalogOpen = true"
      @settings="settingsOpen = true"
      @copy="copyChapter"
    />
    <div
      v-if="resumeNoticeVisible"
      class="reader-resume-notice"
      role="status"
    >
      <span>已回到上次位置 · {{ Math.round(resumeRatio * 100) }}%</span>
      <button
        type="button"
        @click="scrollToRatio(0)"
      >
        回到开头
      </button>
      <button
        type="button"
        aria-label="关闭提示"
        @click="resumeNoticeVisible = false"
      >
        ×
      </button>
    </div>

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
        <div
          ref="contentElement"
          class="reader-content"
        >
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
        <CommentSection
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
        <ReaderSettings />
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
              :class="{ 'is-active': item.id === chapterId, 'is-read': isChapterRead(novelId, item.id) }"
              :aria-current="item.id === chapterId ? 'location' : undefined"
              @click="catalogOpen = false"
            ><span>{{ item.title }}</span><small v-if="item.id === chapterId">当前位置</small><small v-else-if="isChapterRead(novelId, item.id)">已读</small></NuxtLink>
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

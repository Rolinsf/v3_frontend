import type { ChapterContent, NovelDetail } from '~/types/novel'
import { getReadingRatio, getScrollYForReadingRatio } from '~/utils/reader-position'

export function useChapterReading(input: {
  chapter: Ref<ChapterContent | undefined>
  novel: Ref<NovelDetail | undefined>
  novelId: Ref<string>
  chapterId: Ref<string>
  autoAdvance: Ref<boolean>
}) {
  const { getProgress, saveProgress } = useReadingProgress()
  const contentElement = ref<HTMLElement | null>(null)
  const readingRatio = ref(0)
  const resumeRatio = ref(0)
  const resumeNoticeVisible = ref(false)
  const flatChapters = computed(() => input.novel.value?.volumes.flatMap(volume => volume.chapters) ?? [])
  const currentIndex = computed(() => flatChapters.value.findIndex(item => item.id === input.chapterId.value))
  const previousChapterId = computed(() => currentIndex.value > 0 ? flatChapters.value[currentIndex.value - 1]?.id : undefined)
  const nextChapterId = computed(() => flatChapters.value[currentIndex.value + 1]?.id)
  let frame = 0
  let persistTimer: ReturnType<typeof setTimeout> | undefined
  let advanceTimer: ReturnType<typeof setTimeout> | undefined

  function metrics() {
    const element = contentElement.value
    if (!element) return
    const rect = element.getBoundingClientRect()
    return { scrollY: window.scrollY, viewportHeight: window.innerHeight, contentTop: rect.top + window.scrollY, contentHeight: element.offsetHeight }
  }
  function persist() {
    const value = input.chapter.value
    if (!value) return
    saveProgress({ novelId: value.novelId, chapterId: value.id, chapterTitle: value.title, scrollRatio: readingRatio.value, readAt: new Date().toISOString() })
  }
  function update() {
    frame = 0
    const value = metrics()
    if (!value) return
    readingRatio.value = getReadingRatio(value)
    if (!persistTimer) {
      persistTimer = setTimeout(() => {
        persistTimer = undefined
        persist()
      }, 700)
    }
    if (readingRatio.value >= 0.995 && input.autoAdvance.value && nextChapterId.value && !advanceTimer) {
      advanceTimer = setTimeout(() => navigateTo(`/novels/${input.novelId.value}/chapters/${nextChapterId.value}`), 1200)
    } else if (readingRatio.value < 0.995 && advanceTimer) {
      clearTimeout(advanceTimer)
      advanceTimer = undefined
    }
  }
  function onScroll() {
    if (!frame) frame = requestAnimationFrame(update)
  }
  function scrollToRatio(ratio: number, behavior: ScrollBehavior = 'smooth') {
    const value = metrics()
    if (!value) return
    window.scrollTo({ top: getScrollYForReadingRatio(value, ratio), behavior })
    resumeNoticeVisible.value = false
  }
  function restore() {
    const value = input.chapter.value
    if (!value) return
    const saved = getProgress(value.novelId)
    if (saved?.chapterId === value.id && saved.scrollRatio >= 0.03 && saved.scrollRatio < 0.995) {
      resumeRatio.value = saved.scrollRatio
      resumeNoticeVisible.value = true
      nextTick(() => scrollToRatio(saved.scrollRatio, 'auto'))
    } else persist()
  }
  function onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null
    if (target?.matches('input, textarea, [contenteditable="true"]')) return
    if (event.key === 'ArrowLeft' && previousChapterId.value) navigateTo(`/novels/${input.novelId.value}/chapters/${previousChapterId.value}`)
    if (event.key === 'ArrowRight' && nextChapterId.value) navigateTo(`/novels/${input.novelId.value}/chapters/${nextChapterId.value}`)
  }
  watch(input.chapter, async (value, previous) => {
    if (!value || !previous || value.id === previous.id) return
    readingRatio.value = 0
    await nextTick()
    restore()
    update()
  })
  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('scroll', onScroll, { passive: true })
    restore()
    nextTick(update)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    if (persistTimer) clearTimeout(persistTimer)
    if (advanceTimer) clearTimeout(advanceTimer)
    persist()
  })
  onBeforeRouteUpdate(persist)
  return { contentElement, readingRatio, resumeRatio, resumeNoticeVisible, flatChapters, previousChapterId, nextChapterId, scrollToRatio, persistCurrentProgress: persist }
}

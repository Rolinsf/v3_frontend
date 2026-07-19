<script setup lang="ts">
useSeoMeta({
  title: '若林轻小说｜让故事安静生长',
  description: '发现值得慢慢读完的轻小说，也把你心里的故事写下来。'
})

const { data: novels, pending: novelsPending, error: novelsError, refresh: refreshNovels } = useNovelList()
const { data: featured } = useFeaturedNovel()
const { data: categories } = useCategoryTree()
const { progressList } = useReadingProgress()
const admin = useAdmin()
const discoveryItems = computed(() => [...admin.data.value.discoveryItems]
  .filter(item => item.enabled)
  .sort((a, b) => a.order - b.order))
const cloudScale = ref(1)
const cloudOffset = reactive({ x: 0, y: 0 })
const cloudDragging = ref(false)
const cloudInteractive = ref(false)
const discoveryArea = ref<HTMLElement | null>(null)
const discoveryViewport = ref<HTMLElement | null>(null)
let cloudPointerStart = { x: 0, y: 0 }
let cloudOffsetStart = { x: 0, y: 0 }
let cloudDidDrag = false
let cloudFrame: number | null = null
let pendingCloudOffset: { x: number, y: number } | null = null
let pendingCloudScale: number | null = null

const recommendationCard = ref<HTMLElement | null>(null)
const recommendationOffset = reactive({ x: 0, y: 0 })
const recommendationDragging = ref(false)
let recommendationPointerStart = { x: 0, y: 0 }
let recommendationOffsetStart = { x: 0, y: 0 }
let recommendationBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 }
let recommendationDidDrag = false
let recommendationFrame: number | null = null
let pendingRecommendationOffset: { x: number, y: number } | null = null

const cloudTransform = computed(() => `translate3d(${cloudOffset.x}px, ${cloudOffset.y}px, 0) scale(${cloudScale.value})`)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function flushCloudFrame() {
  cloudFrame = null
  if (pendingCloudOffset) {
    Object.assign(cloudOffset, pendingCloudOffset)
    pendingCloudOffset = null
  }
  if (pendingCloudScale !== null) {
    cloudScale.value = pendingCloudScale
    pendingCloudScale = null
  }
}

function scheduleCloudUpdate(offset?: { x: number, y: number }, scale?: number) {
  if (offset) pendingCloudOffset = offset
  if (scale !== undefined) pendingCloudScale = clamp(scale, 0.6, 1.8)
  if (cloudFrame === null) cloudFrame = requestAnimationFrame(flushCloudFrame)
}

function startCloudDrag(event: PointerEvent) {
  if (event.button !== 0 || !cloudInteractive.value || window.matchMedia('(max-width: 639px)').matches) return
  cloudDragging.value = true
  cloudDidDrag = false
  cloudPointerStart = { x: event.clientX, y: event.clientY }
  cloudOffsetStart = { ...cloudOffset }
}

function moveCloud(event: PointerEvent) {
  if (!cloudDragging.value) return
  const x = event.clientX - cloudPointerStart.x
  const y = event.clientY - cloudPointerStart.y
  if (Math.abs(x) + Math.abs(y) > 4 && !cloudDidDrag) {
    cloudDidDrag = true
    discoveryViewport.value?.setPointerCapture(event.pointerId)
  }
  if (!cloudDidDrag) return
  const viewport = discoveryViewport.value
  const limitX = (viewport?.clientWidth ?? 1000) * 0.65
  const limitY = (viewport?.clientHeight ?? 500) * 0.65
  scheduleCloudUpdate({
    x: clamp(cloudOffsetStart.x + x, -limitX, limitX),
    y: clamp(cloudOffsetStart.y + y, -limitY, limitY)
  })
}

function stopCloudDrag() {
  cloudDragging.value = false
}

function zoomCloudByWheel(event: WheelEvent) {
  if (!cloudInteractive.value || window.matchMedia('(max-width: 639px)').matches) return
  event.preventDefault()
  const delta = clamp(event.deltaY, -100, 100)
  const currentScale = pendingCloudScale ?? cloudScale.value
  scheduleCloudUpdate(undefined, currentScale - delta * 0.0015)
}

function guardCloudLink(event: MouseEvent) {
  if (cloudDidDrag) event.preventDefault()
  cloudDidDrag = false
}

function activateCloudInteraction() {
  if (!window.matchMedia('(max-width: 639px)').matches) cloudInteractive.value = true
}

function deactivateCloudInteraction(event: PointerEvent) {
  if (event.target instanceof Node && !discoveryArea.value?.contains(event.target)) cloudInteractive.value = false
}

const recommendationTransform = computed(() => `translate3d(${recommendationOffset.x}px, ${recommendationOffset.y}px, 0)`)

function startRecommendationDrag(event: PointerEvent) {
  if (event.button !== 0 || window.matchMedia('(max-width: 639px)').matches || !discoveryViewport.value || !recommendationCard.value) return
  recommendationDragging.value = true
  stopCarousel()
  recommendationDidDrag = false
  recommendationPointerStart = { x: event.clientX, y: event.clientY }
  recommendationOffsetStart = { ...recommendationOffset }
  const viewportRect = discoveryViewport.value.getBoundingClientRect()
  const cardRect = recommendationCard.value.getBoundingClientRect()
  const baseLeft = cardRect.left - recommendationOffset.x
  const baseTop = cardRect.top - recommendationOffset.y
  recommendationBounds = {
    minX: viewportRect.left - baseLeft,
    maxX: viewportRect.right - baseLeft - cardRect.width,
    minY: viewportRect.top - baseTop,
    maxY: viewportRect.bottom - baseTop - cardRect.height
  }
}

function flushRecommendationFrame() {
  recommendationFrame = null
  if (!pendingRecommendationOffset) return
  Object.assign(recommendationOffset, pendingRecommendationOffset)
  pendingRecommendationOffset = null
}

function moveRecommendation(event: PointerEvent) {
  if (!recommendationDragging.value) return
  const x = event.clientX - recommendationPointerStart.x
  const y = event.clientY - recommendationPointerStart.y
  if (Math.abs(x) + Math.abs(y) > 4 && !recommendationDidDrag) {
    recommendationDidDrag = true
    recommendationCard.value?.setPointerCapture(event.pointerId)
  }
  if (!recommendationDidDrag) return
  pendingRecommendationOffset = {
    x: clamp(recommendationOffsetStart.x + x, recommendationBounds.minX, recommendationBounds.maxX),
    y: clamp(recommendationOffsetStart.y + y, recommendationBounds.minY, recommendationBounds.maxY)
  }
  if (recommendationFrame === null) recommendationFrame = requestAnimationFrame(flushRecommendationFrame)
}

function stopRecommendationDrag() {
  recommendationDragging.value = false
  startCarousel()
}

function guardRecommendationLink(event: MouseEvent) {
  if (recommendationDidDrag) event.preventDefault()
  recommendationDidDrag = false
}

const featuredNovels = computed(() => novels.value?.slice(0, 3) ?? [])
const heroRecommendations = computed(() => novels.value?.length ? novels.value : featured.value ? [featured.value] : [])
const activeRecommendationIndex = ref(0)
const activeRecommendation = computed(() => heroRecommendations.value[activeRecommendationIndex.value])
let carouselTimer: ReturnType<typeof setInterval> | null = null

function showRecommendation(index: number) {
  const total = heroRecommendations.value.length
  if (!total) return
  activeRecommendationIndex.value = (index + total) % total
}

function showPreviousRecommendation() {
  showRecommendation(activeRecommendationIndex.value - 1)
}

function showNextRecommendation() {
  showRecommendation(activeRecommendationIndex.value + 1)
}

function stopCarousel() {
  if (carouselTimer) clearInterval(carouselTimer)
  carouselTimer = null
}

function startCarousel() {
  stopCarousel()
  if (heroRecommendations.value.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  carouselTimer = setInterval(showNextRecommendation, 6000)
}

onMounted(() => {
  startCarousel()
  document.addEventListener('pointerdown', deactivateCloudInteraction)
})
onBeforeUnmount(() => {
  stopCarousel()
  document.removeEventListener('pointerdown', deactivateCloudInteraction)
  if (cloudFrame !== null) cancelAnimationFrame(cloudFrame)
  if (recommendationFrame !== null) cancelAnimationFrame(recommendationFrame)
  pendingCloudOffset = null
  pendingCloudScale = null
  pendingRecommendationOffset = null
})

const recentNovels = computed(() => novels.value ?? [])
// 新作发现：连载中且字数 < 10 万，按更新时间倒序取前 3。
const debutNovels = computed(() => {
  const list = novels.value?.filter(n => n.status === 'serializing' && n.wordCount < 100000) ?? []
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
})

// 继续阅读：取最近一次阅读进度；仅客户端渲染，避免 SSR/CSR 状态错位。
const continueProgress = computed(() => progressList.value[0])
const continueNovel = computed(() => novels.value?.find(n => n.id === continueProgress.value?.novelId))

function formatReadAt(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div>
    <section class="home-hero">
      <div class="site-container home-hero__inner">
        <div
          ref="discoveryArea"
          class="home-hero__discovery"
          :class="{ 'is-cloud-active': cloudInteractive }"
          @pointerdown="activateCloudInteraction"
          @wheel="zoomCloudByWheel"
        >
          <div
            v-if="activeRecommendation"
            ref="recommendationCard"
            class="featured-note"
            :class="{ 'is-dragging': recommendationDragging }"
            :style="{ transform: recommendationTransform }"
            role="region"
            aria-roledescription="轮播"
            aria-label="本周编辑推荐"
            tabindex="0"
            @mouseenter="stopCarousel"
            @mouseleave="startCarousel"
            @focusin="stopCarousel"
            @focusout="startCarousel"
            @keydown.left.prevent="showPreviousRecommendation"
            @keydown.right.prevent="showNextRecommendation"
            @pointerdown="startRecommendationDrag"
            @pointermove="moveRecommendation"
            @pointerup="stopRecommendationDrag"
            @pointercancel="stopRecommendationDrag"
          >
            <Transition
              name="recommendation-fade"
              mode="out-in"
            >
              <NuxtLink
                :key="activeRecommendation.id"
                :to="`/novels/${activeRecommendation.id}`"
                class="featured-note__content"
                @click="guardRecommendationLink"
              >
                <NovelNovelCover
                  :title="activeRecommendation.title"
                  :tone="activeRecommendation.coverTone"
                />
                <div>
                  <p class="featured-note__label">
                    本周编辑推荐
                  </p>
                  <h2>{{ activeRecommendation.title }}</h2>
                  <p>{{ activeRecommendation.synopsis }}</p>
                  <span>开始阅读 <UIcon name="i-lucide-arrow-right" /></span>
                </div>
              </NuxtLink>
            </Transition>
            <template v-if="heroRecommendations.length > 1">
              <button
                type="button"
                class="featured-note__arrow featured-note__arrow--previous"
                aria-label="上一部推荐"
                @pointerdown.stop
                @click="showPreviousRecommendation"
              >
                <UIcon name="i-lucide-chevron-left" />
              </button>
              <button
                type="button"
                class="featured-note__arrow featured-note__arrow--next"
                aria-label="下一部推荐"
                @pointerdown.stop
                @click="showNextRecommendation"
              >
                <UIcon name="i-lucide-chevron-right" />
              </button>
              <div
                class="featured-note__dots"
                aria-label="选择推荐书籍"
              >
                <button
                  v-for="(recommendation, index) in heroRecommendations"
                  :key="recommendation.id"
                  type="button"
                  :class="{ 'is-active': index === activeRecommendationIndex }"
                  :aria-label="`查看第 ${index + 1} 部推荐：${recommendation.title}`"
                  :aria-current="index === activeRecommendationIndex ? 'true' : undefined"
                  @pointerdown.stop
                  @click="showRecommendation(index)"
                />
              </div>
            </template>
          </div>
          <aside
            v-if="discoveryItems.length"
            ref="discoveryViewport"
            class="discovery-cloud"
            aria-label="作者与作品发现"
            title="拖动移动标签云，滚动鼠标滚轮缩放"
            :class="{ 'is-dragging': cloudDragging }"
            @pointerdown="startCloudDrag"
            @pointermove="moveCloud"
            @pointerup="stopCloudDrag"
            @pointercancel="stopCloudDrag"
          >
            <div
              class="discovery-cloud__items"
              :style="{ transform: cloudTransform }"
            >
              <NuxtLink
                v-for="item in discoveryItems"
                :key="item.id"
                :to="item.url"
                class="discovery-cloud__item"
                :class="[`is-emphasis-${item.emphasis}`, `is-${item.type}`]"
                @click="guardCloudLink"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <ClientOnly>
      <section
        v-if="continueProgress && continueNovel"
        class="home-section home-section--surface"
      >
        <div class="site-container">
          <div class="home-continue">
            <UIcon
              name="i-lucide-bookmark"
              class="home-continue__icon"
              aria-hidden="true"
            />
            <div class="home-continue__body">
              <p class="home-continue__label">
                继续阅读
              </p>
              <h3>{{ continueNovel.title }}</h3>
              <p>{{ formatReadAt(continueProgress.readAt) }} 读到此处</p>
            </div>
            <UButton
              :to="`/novels/${continueProgress.novelId}/chapters/${continueProgress.chapterId}`"
              label="继续"
              trailing-icon="i-lucide-arrow-right"
            />
          </div>
        </div>
      </section>
    </ClientOnly>

    <section class="home-section">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>编辑推荐</h2>
            <p>一些值得慢慢读下去的故事。</p>
          </div>
          <NuxtLink
            to="/novels"
            class="home-section__link"
          >查看全部 →</NuxtLink>
        </div>
        <ErrorState
          v-if="novelsError"
          :description="novelsError.statusMessage || '无法加载小说列表，请稍后重试。'"
          @retry="refreshNovels()"
        />
        <LoadingSkeleton
          v-else-if="novelsPending"
          variant="card"
          :rows="3"
        />
        <div
          v-else
          class="novel-grid"
        >
          <NovelNovelCard
            v-for="novel in featuredNovels"
            :key="novel.id"
            :novel="novel"
          />
        </div>
      </div>
    </section>

    <section class="home-section home-section--surface">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>最近更新</h2>
            <p>刚刚长出新枝叶的故事。</p>
          </div>
          <NuxtLink
            to="/novels?sort=updated"
            class="home-section__link"
          >更多更新 →</NuxtLink>
        </div>
        <ErrorState
          v-if="novelsError"
          :description="novelsError.statusMessage || '无法加载最近更新，请稍后重试。'"
          @retry="refreshNovels()"
        />
        <LoadingSkeleton
          v-else-if="novelsPending"
          variant="list"
          :rows="4"
        />
        <div
          v-else
          class="update-list"
        >
          <NovelNovelCompactItem
            v-for="novel in recentNovels"
            :key="novel.id"
            :novel="novel"
          />
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>新作发现</h2>
            <p>还在悄悄成长的小作品，或许会成为你的下一个心头好。</p>
          </div>
        </div>
        <div
          v-if="debutNovels.length"
          class="novel-grid"
        >
          <NovelNovelCard
            v-for="novel in debutNovels"
            :key="novel.id"
            :novel="novel"
          />
        </div>
        <EmptyState
          v-else
          icon="i-lucide-sparkles"
          title="还在等待第一篇新作"
          description="新的故事正在路上，过几天再来看看吧。"
        />
      </div>
    </section>

    <section class="home-section home-section--surface">
      <div class="site-container">
        <div class="home-section__heading">
          <div>
            <h2>按分类散步</h2>
            <p>从熟悉的题材出发，遇见意料之外的故事。</p>
          </div>
        </div>
        <div class="category-list">
          <NuxtLink
            v-for="category in categories ?? []"
            :key="category.id"
            :to="{ path: '/novels', query: { category: category.slug } }"
          >
            <UIcon :name="category.icon || 'i-lucide-bookmark'" />{{ category.name }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-hero { padding-top: 1rem; }
.home-hero__inner { display: block; }
.home-hero__discovery { position: relative; min-width: 0; min-height: 30rem; }
.discovery-cloud {
  height: 30rem;
  min-height: 30rem;
  padding: 2rem;
  border: 1px solid var(--color-brand-200);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--site-surface) 90%, transparent);
  overflow: hidden;
  cursor: default;
  touch-action: auto;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.home-hero__discovery.is-cloud-active .discovery-cloud {
  border-color: var(--color-brand-400);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-200) 45%, transparent);
  cursor: grab;
  touch-action: none;
}
.discovery-cloud.is-dragging { cursor: grabbing; user-select: none; }
.discovery-cloud__items {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  min-height: 100%;
  gap: 1rem 1.7rem;
  padding: 1.5rem;
  transform-origin: center;
  will-change: transform;
}
.discovery-cloud__item {
  color: var(--color-brand-500);
  line-height: 1.5;
  user-select: none;
  transition: color 180ms ease, transform 180ms ease;
}
.discovery-cloud__item:hover { color: var(--color-brand-800); transform: translateY(-1px); }
.discovery-cloud__item.is-author { color: var(--color-brand-700); }
.discovery-cloud__item.is-emphasis-1 { font-size: .95rem; }
.discovery-cloud__item.is-emphasis-2 { font-size: 1.25rem; }
.discovery-cloud__item.is-emphasis-3 { font-size: 1.65rem; font-weight: 600; }
.featured-note {
  position: absolute;
  z-index: 2;
  top: 7rem;
  right: 2rem;
  display: block;
  width: min(34rem, calc(100% - 4rem));
  min-width: 0;
  overflow: hidden;
  cursor: move;
  touch-action: none;
}
.featured-note.is-dragging { cursor: grabbing; user-select: none; }
.featured-note__content {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1.4rem;
  align-items: center;
  color: inherit;
}
.featured-note__arrow {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--color-brand-200);
  border-radius: 50%;
  background: color-mix(in srgb, var(--site-surface) 94%, transparent);
  color: var(--color-brand-700);
  cursor: pointer;
  line-height: 0;
  opacity: 0;
  transform: translateY(-50%);
  transition: opacity 180ms ease, background-color 180ms ease;
}
.featured-note__arrow > * { width: 1rem; height: 1rem; margin: 0; }
.featured-note:hover .featured-note__arrow,
.featured-note:focus-within .featured-note__arrow { opacity: 1; }
.featured-note__arrow:hover { background: var(--color-brand-100); }
.featured-note__arrow--previous { left: .75rem; }
.featured-note__arrow--next { right: .75rem; }
.featured-note__dots {
  position: absolute;
  right: 1rem;
  bottom: .7rem;
  display: flex;
  gap: .35rem;
}
.featured-note__dots button {
  width: .45rem;
  height: .45rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--color-brand-200);
  cursor: pointer;
  transition: width 180ms ease, background-color 180ms ease;
}
.featured-note__dots button.is-active {
  width: 1.25rem;
  background: var(--color-brand-600);
}
.recommendation-fade-enter-active,
.recommendation-fade-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.recommendation-fade-enter-from { opacity: 0; transform: translateX(1rem); }
.recommendation-fade-leave-to { opacity: 0; transform: translateX(-1rem); }

.home-continue {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-brand-200);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--site-surface) 92%, transparent);
}
.home-continue__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-brand-600);
}
.home-continue__label {
  color: var(--color-brand-700);
  font-size: .75rem;
  letter-spacing: .12em;
}
.home-continue__body h3 {
  margin: .35rem 0 .25rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.home-continue__body p {
  margin: 0;
  color: var(--site-muted);
  font-size: .8rem;
}
@media (max-width: 639px) {
  .home-hero__discovery { display: grid; gap: 1rem; min-height: 0; }
  .featured-note { position: relative; top: auto; right: auto; width: 100%; transform: none; }
  .discovery-cloud { display: none; }
  .featured-note__content { grid-template-columns: 5.5rem 1fr; gap: 1rem; }
  .featured-note__arrow { opacity: 1; }
  .featured-note__arrow--previous { left: .25rem; }
  .featured-note__arrow--next { right: .25rem; }
  .home-continue {
    grid-template-columns: auto 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  .home-continue__body p {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .featured-note__arrow,
  .featured-note__dots button,
  .recommendation-fade-enter-active,
  .recommendation-fade-leave-active { transition: none; }
}
</style>

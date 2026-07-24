export function useRecommendationCarousel<T>(items: Ref<T[]>, interval = 6000) {
  const activeIndex = ref(0)
  const activeItem = computed(() => items.value[activeIndex.value])
  let timer: ReturnType<typeof setInterval> | undefined

  function show(index: number) {
    if (!items.value.length) return
    activeIndex.value = (index + items.value.length) % items.value.length
  }
  function previous() {
    show(activeIndex.value - 1)
  }
  function next() {
    show(activeIndex.value + 1)
  }
  function stop() {
    if (timer) clearInterval(timer)
    timer = undefined
  }
  function start() {
    stop()
    if (items.value.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer = setInterval(next, interval)
  }
  onMounted(start)
  onBeforeUnmount(stop)
  watch(() => items.value.length, () => {
    if (activeIndex.value >= items.value.length) activeIndex.value = 0
    if (import.meta.client) start()
  })
  return { activeIndex, activeItem, show, previous, next, start, stop }
}

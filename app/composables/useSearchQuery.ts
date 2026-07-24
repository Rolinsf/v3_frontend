import type { NovelSearchQuery } from './useNovels'
import type { Category } from '~/types/novel'

const HISTORY_KEY = 'wakabayashi-search-history'
const HISTORY_MAX = 10

export function useSearchQuery(categories: Ref<Category[] | undefined>) {
  const route = useRoute()
  const router = useRouter()
  const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const committedKeyword = ref(keyword.value)
  const selectedCategory = ref(typeof route.query.category === 'string' ? route.query.category : '')
  const selectedSubcategory = ref(typeof route.query.subcategory === 'string' ? route.query.subcategory : '')
  const activeTab = ref<'novels' | 'users'>(route.query.tab === 'users' ? 'users' : 'novels')
  const searchHistory = ref<string[]>([])
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const currentCategory = computed(() => categories.value?.find(item => item.slug === selectedCategory.value))
  const query = computed<NovelSearchQuery>(() => ({
    q: committedKeyword.value || undefined,
    category: selectedCategory.value || undefined,
    subcategory: selectedSubcategory.value || undefined,
    sort: 'updated'
  }))
  const hasQuery = computed(() => Boolean(committedKeyword.value.trim()))

  function persistHistory() {
    if (!import.meta.client) return
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
  }
  function pushHistory(term: string) {
    searchHistory.value = [term, ...searchHistory.value.filter(item => item !== term)].slice(0, HISTORY_MAX)
    try {
      persistHistory()
    } catch {
      // 本地存储不可用。
    }
  }
  function clearHistory() {
    searchHistory.value = []
    if (import.meta.client) localStorage.removeItem(HISTORY_KEY)
  }
  function syncUrl() {
    const next: Record<string, string> = {}
    if (committedKeyword.value) next.q = committedKeyword.value
    if (selectedCategory.value) next.category = selectedCategory.value
    if (selectedSubcategory.value) next.subcategory = selectedSubcategory.value
    if (activeTab.value !== 'novels') next.tab = activeTab.value
    router.replace({ query: next })
  }
  function commitNow() {
    if (debounceTimer) clearTimeout(debounceTimer)
    committedKeyword.value = keyword.value
  }
  function applyTerm(term: string) {
    keyword.value = term
    commitNow()
  }

  watch(keyword, (value) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      committedKeyword.value = value
    }, 300)
  })
  watch(committedKeyword, (value) => {
    syncUrl()
    if (value.trim()) pushHistory(value.trim())
  })
  watch([selectedCategory, selectedSubcategory, activeTab], syncUrl)
  watch(selectedCategory, () => {
    const valid = currentCategory.value?.children.some(item => item.slug === selectedSubcategory.value)
    if (selectedSubcategory.value && !valid) selectedSubcategory.value = ''
  })
  onMounted(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
      if (Array.isArray(parsed)) searchHistory.value = parsed.filter((item): item is string => typeof item === 'string').slice(0, HISTORY_MAX)
    } catch { searchHistory.value = [] }
  })
  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return { keyword, committedKeyword, selectedCategory, selectedSubcategory, activeTab, currentCategory, query, hasQuery, searchHistory, commitNow, clearHistory, applyTerm }
}

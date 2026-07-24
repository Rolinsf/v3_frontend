import { defineStore } from 'pinia'
import type { ReaderFont, ReaderSettings, ReaderTheme } from '~/types/reader'
import { DEFAULT_READER_SETTINGS, READER_SETTINGS_STORAGE_KEY } from '~/types/reader'

export const useReaderStore = defineStore('reader', () => {
  const fontSize = ref(DEFAULT_READER_SETTINGS.fontSize)
  const lineHeight = ref(DEFAULT_READER_SETTINGS.lineHeight)
  const pageWidth = ref(DEFAULT_READER_SETTINGS.pageWidth)
  const theme = ref<ReaderTheme>(DEFAULT_READER_SETTINGS.theme)
  const font = ref<ReaderFont>(DEFAULT_READER_SETTINGS.font)
  const autoAdvance = ref(DEFAULT_READER_SETTINGS.autoAdvance)
  const initialized = ref(false)

  const readerStyle = computed(() => ({
    '--reader-font-size': `${fontSize.value}px`,
    '--reader-line-height': lineHeight.value,
    '--reader-width': `${pageWidth.value}px`
  }))

  function initialize() {
    if (!import.meta.client || initialized.value) return
    try {
      const raw = localStorage.getItem(READER_SETTINGS_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ReaderSettings>
        fontSize.value = saved.fontSize ?? fontSize.value
        lineHeight.value = saved.lineHeight ?? lineHeight.value
        pageWidth.value = saved.pageWidth ?? pageWidth.value
        theme.value = saved.theme ?? theme.value
        font.value = saved.font ?? font.value
        autoAdvance.value = saved.autoAdvance ?? autoAdvance.value
      }
    } catch {
      // 损坏的阅读设置使用默认值。
    }
    initialized.value = true
  }

  function persist() {
    if (!import.meta.client || !initialized.value) return
    const settings: ReaderSettings = {
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      pageWidth: pageWidth.value,
      theme: theme.value,
      font: font.value,
      autoAdvance: autoAdvance.value
    }
    try {
      localStorage.setItem(READER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // 本地存储不可用时保留当前会话设置。
    }
  }

  return { fontSize, lineHeight, pageWidth, theme, font, autoAdvance, initialized, readerStyle, initialize, persist }
})

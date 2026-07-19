export type { ReaderFont, ReaderTheme } from '~/types/reader'

export function useReader() {
  const store = useReaderStore()
  const { fontSize, lineHeight, pageWidth, theme, font, readerStyle } = storeToRefs(store)
  return { fontSize, lineHeight, pageWidth, theme, font, readerStyle }
}

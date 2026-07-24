export type PublishCheckSeverity = 'error' | 'warning' | 'passed'

export interface PublishCheck {
  id: 'title' | 'wordCount' | 'sensitive' | 'emptyParagraphs'
  label: string
  detail: string
  severity: PublishCheckSeverity
}

const SENSITIVE_TERMS = ['自杀', '毒品', '色情', '仇恨']

export function inspectChapter(title: string, plainText: string): PublishCheck[] {
  const titleValid = title.trim().length >= 2 && title.trim().length <= 100
  const wordCount = plainText.replace(/\s/g, '').length
  const matchedTerms = SENSITIVE_TERMS.filter(term => plainText.includes(term))
  const emptyParagraphs = plainText.split('\n').filter(line => !line.trim()).length

  return [
    { id: 'title', label: '章节标题', detail: titleValid ? '标题完整' : '标题需为 2–100 个字', severity: titleValid ? 'passed' : 'error' },
    { id: 'wordCount', label: '正文字数', detail: `${wordCount.toLocaleString('zh-CN')} 字${wordCount < 20 ? '，至少需要 20 字' : wordCount < 500 ? '，篇幅较短，请确认内容完整' : ''}`, severity: wordCount < 20 ? 'error' : wordCount < 500 ? 'warning' : 'passed' },
    { id: 'sensitive', label: '敏感内容', detail: matchedTerms.length ? `检测到需复核的词语：${matchedTerms.join('、')}` : '未发现需复核的词语', severity: matchedTerms.length ? 'warning' : 'passed' },
    { id: 'emptyParagraphs', label: '空段落', detail: emptyParagraphs ? `发现 ${emptyParagraphs} 个空段落` : '段落结构正常', severity: emptyParagraphs ? 'warning' : 'passed' }
  ]
}

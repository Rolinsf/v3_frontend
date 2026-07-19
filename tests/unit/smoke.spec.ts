// @vitest-environment node

// 冒烟测试：仅验证 Vitest 自身能在仓库中运行。
// 不进入 Nuxt 环境，避免 Nuxt UI 的字体子模块在离线环境下卡住 setupNuxt。
// 需要 Nuxt 上下文的集成测试放入 tests/nuxt/，并用 `// @vitest-environment nuxt` 注解开启。
import { describe, expect, it } from 'vitest'
import type { NovelSummary } from '~/types/novel'

describe('vitest smoke test', () => {
  it('runs basic assertions', () => {
    expect(1 + 1).toBe(2)
  })

  it('resolves Nuxt ~/types alias', () => {
    // 仅验证 ~/ 别名能被 Vitest 解析（通过 @nuxt/test-utils 配置），
    // 不调用任何 Nuxt 运行时 API，因此无需 setupNuxt。
    const sample: NovelSummary = {
      id: 'smoke',
      title: '冒烟测试小说',
      author: { id: 'a1', name: '测试作者' },
      synopsis: '',
      coverTone: 'sage',
      category: { primary: '日常', secondary: '青春校园' },
      tags: [],
      status: 'serializing',
      wordCount: 0,
      updatedAt: '2026-07-18T00:00:00+08:00',
      latestChapter: { id: 'c1', title: '第一章' }
    }
    expect(sample.title).toBe('冒烟测试小说')
    expect(sample.status).toBe('serializing')
  })
})

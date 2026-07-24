// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MobileTabBar from '~/components/navigation/MobileTabBar.vue'

describe('MobileTabBar', () => {
  beforeEach(() => {
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
  })

  it('renders the five mobile destinations and marks the current route', () => {
    const wrapper = mount(MobileTabBar)

    expect(wrapper.get('nav').attributes('aria-label')).toBe('移动端主导航')
    expect(wrapper.findAll('nuxtlink')).toHaveLength(5)
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('书库')
    expect(wrapper.text()).toContain('书架')
    expect(wrapper.text()).toContain('创作')
    expect(wrapper.text()).toContain('我的')
    expect(wrapper.get('nuxtlink[to="/"]').classes()).toContain('is-active')
  })
})

<script setup lang="ts">
const route = useRoute()
const items = [
  { label: '首页', icon: 'i-lucide-house', to: '/' },
  { label: '书库', icon: 'i-lucide-library', to: '/novels' },
  { label: '书架', icon: 'i-lucide-bookmark', to: '/account?section=reading' },
  { label: '创作', icon: 'i-lucide-pen-line', to: '/account?section=works' },
  { label: '我的', icon: 'i-lucide-user', to: '/account' }
]
</script>

<template>
  <nav
    class="mobile-tab-bar"
    aria-label="移动端主导航"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mobile-tab-bar__item"
      :class="{ 'is-active': route.path === item.to }"
    >
      <UIcon
        :name="item.icon"
        class="mobile-tab-bar__icon"
      /><span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

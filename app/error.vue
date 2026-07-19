<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const isNotFound = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <UApp>
    <div class="site-shell">
      <NavigationSiteHeader />
      <main class="site-main error-page">
        <ErrorState
          :icon="isNotFound ? 'i-lucide-book-dashed' : 'i-lucide-circle-alert'"
          :title="isNotFound ? '这一页暂时找不到' : '页面出了点问题'"
          :description="isNotFound ? '故事可能搬了家，或者这个地址已经失效。' : '请返回首页稍后再试。'"
          retry-label="返回首页"
          @retry="goHome"
        />
      </main>
      <NavigationSiteFooter />
    </div>
  </UApp>
</template>

<style scoped>
.error-page {
  display: grid;
  min-height: 60vh;
  place-items: center;
}
</style>

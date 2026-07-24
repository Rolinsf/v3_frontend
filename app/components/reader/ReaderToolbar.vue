<script setup lang="ts">
defineProps<{ novelId: string, title?: string, novelTitle?: string, visible: boolean, progress: number, previous?: string, next?: string }>()
const emit = defineEmits<{ catalog: [], settings: [], copy: [] }>()
</script>

<template>
  <header
    class="reader-toolbar"
    :class="{ 'is-hidden': !visible }"
  >
    <div class="reader-toolbar__inner">
      <UButton
        :to="`/novels/${novelId}`"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        :label="novelTitle ?? '返回作品'"
        class="reader-toolbar__back"
      />
      <p>{{ title }}</p>
      <div>
        <UButton
          icon="i-lucide-list"
          color="neutral"
          variant="ghost"
          aria-label="章节目录"
          @click="emit('catalog')"
        /><UButton
          icon="i-lucide-settings-2"
          color="neutral"
          variant="ghost"
          aria-label="阅读设置"
          @click="emit('settings')"
        />
      </div>
    </div>
  </header>
  <nav
    class="reader-mobile-toolbar"
    :class="{ 'is-hidden': !visible }"
    aria-label="移动端阅读工具栏"
  >
    <UButton
      :disabled="!previous"
      :to="previous ? `/novels/${novelId}/chapters/${previous}` : undefined"
      icon="i-lucide-chevron-left"
      color="neutral"
      variant="ghost"
      aria-label="上一章"
    />
    <UButton
      icon="i-lucide-list"
      color="neutral"
      variant="ghost"
      label="目录"
      @click="emit('catalog')"
    />
    <span>{{ Math.round(progress * 100) }}%</span>
    <UButton
      icon="i-lucide-copy"
      color="neutral"
      variant="ghost"
      aria-label="复制选中文字或本章正文"
      @click="emit('copy')"
    />
    <UButton
      :disabled="!next"
      :to="next ? `/novels/${novelId}/chapters/${next}` : undefined"
      icon="i-lucide-chevron-right"
      color="neutral"
      variant="ghost"
      aria-label="下一章"
    />
  </nav>
</template>

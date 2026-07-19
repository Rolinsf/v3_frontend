<script setup lang="ts">
defineProps<{ title: string, tone?: string }>()
</script>

<template>
  <div
    class="novel-cover"
    :class="`novel-cover--${tone || 'sage'}`"
    role="img"
    :aria-label="`${title}封面`"
  >
    <UIcon
      name="i-lucide-leaf"
      class="novel-cover__leaf"
    />
    <span class="novel-cover__title">{{ title }}</span>
    <span class="novel-cover__line" />
    <small>若林轻小说</small>
  </div>
</template>

<script setup lang="ts">
import type { NovelSummary } from '~/types/novel'

defineProps<{ novel: NovelSummary }>()

function formatWords(value: number) {
  return `${(value / 10000).toFixed(1)} 万字`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(value))
}
</script>

<template>
  <article class="novel-compact-item">
    <NovelNovelCover
      :title="novel.title"
      :tone="novel.coverTone"
    />
    <div class="novel-compact-item__main">
      <h3><NuxtLink :to="`/novels/${novel.id}`">{{ novel.title }}</NuxtLink></h3>
      <p>{{ novel.author.name }} · {{ formatWords(novel.wordCount) }}</p>
    </div>
    <NuxtLink
      :to="`/novels/${novel.id}/chapters/${novel.latestChapter.id}`"
      class="novel-compact-item__chapter"
    >
      {{ novel.latestChapter.title }}
    </NuxtLink>
    <time :datetime="novel.updatedAt">{{ formatDate(novel.updatedAt) }}</time>
  </article>
</template>

<script setup lang="ts">
import type { NovelSummary } from '~/types/novel'

defineProps<{ novel: NovelSummary }>()
</script>

<template>
  <article class="novel-card">
    <NuxtLink
      :to="`/novels/${novel.id}`"
      class="novel-card__cover-link"
    >
      <NovelCover
        :title="novel.title"
        :tone="novel.coverTone"
      />
    </NuxtLink>
    <div class="novel-card__body">
      <p class="novel-card__category">
        {{ novel.category.primary }} / {{ novel.category.secondary }}
      </p>
      <h3><NuxtLink :to="`/novels/${novel.id}`">{{ novel.title }}</NuxtLink></h3>
      <p class="novel-card__author">
        {{ novel.author.name }}
      </p>
      <p class="novel-card__synopsis">
        {{ novel.synopsis }}
      </p>
      <div class="novel-tags">
        <span
          v-for="tag in novel.tags.slice(0, 2)"
          :key="tag.id"
        >{{ tag.name }}</span>
      </div>
    </div>
  </article>
</template>

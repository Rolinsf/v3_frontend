<script setup lang="ts">
import type { NovelSummary } from '~/types/novel'

const props = defineProps<{ novels: NovelSummary[], query: string }>()

function segments(value: string) {
  const terms = props.query.trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return [{ text: value, match: false }]
  const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return value.split(pattern).filter(Boolean).map(text => ({
    text,
    match: terms.some(term => text.toLocaleLowerCase() === term.toLocaleLowerCase())
  }))
}
</script>

<template>
  <div class="novel-search-results">
    <NuxtLink
      v-for="novel in novels"
      :key="novel.id"
      :to="`/novels/${novel.id}`"
      class="novel-search-result"
    >
      <NovelCover
        :title="novel.title"
        :tone="novel.coverTone"
        class="novel-search-result__cover"
      />
      <div>
        <h2>
          <template
            v-for="(part, index) in segments(novel.title)"
            :key="index"
          ><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
        </h2>
        <p class="novel-search-result__meta">
          <template
            v-for="(part, index) in segments(novel.author.name)"
            :key="index"
          ><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          · {{ novel.category.primary }} / {{ novel.category.secondary }}
        </p>
        <p class="novel-search-result__synopsis">
          <template
            v-for="(part, index) in segments(novel.synopsis)"
            :key="index"
          ><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
        </p>
        <div class="novel-search-result__tags">
          <span
            v-for="tag in novel.tags"
            :key="tag.id"
          >{{ tag.name }}</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.novel-search-results{display:grid;gap:.75rem}.novel-search-result{display:grid;grid-template-columns:5rem 1fr;gap:1rem;padding:1rem;border:1px solid var(--site-line);border-radius:.75rem;background:var(--site-surface)}.novel-search-result__cover{width:5rem}.novel-search-result h2{margin:0;font-family:var(--font-reading);font-size:1.05rem}.novel-search-result__meta,.novel-search-result__synopsis{margin:.35rem 0 0;color:var(--site-muted);font-size:.78rem}.novel-search-result__synopsis{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2}.novel-search-result__tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem}.novel-search-result__tags span{padding:.15rem .45rem;border-radius:999px;background:var(--color-brand-50);color:var(--color-brand-800);font-size:.68rem}.novel-search-result mark{background:var(--color-brand-100);color:inherit}@media(max-width:639px){.novel-search-result{grid-template-columns:4rem 1fr}.novel-search-result__cover{width:4rem}}
</style>

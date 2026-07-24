<script setup lang="ts">
defineProps<{ history: string[], hot: string[] }>()
const emit = defineEmits<{ select: [term: string], clear: [] }>()
</script>

<template>
  <section class="search-suggest">
    <div
      v-if="history.length"
      class="search-suggest-block"
    >
      <div class="search-suggest-block__head">
        <h2>最近搜索</h2><button
          type="button"
          @click="emit('clear')"
        >
          清除
        </button>
      </div>
      <div class="search-suggest-chips">
        <button
          v-for="term in history"
          :key="term"
          type="button"
          @click="emit('select', term)"
        >
          {{ term }}
        </button>
      </div>
    </div>
    <div class="search-suggest-block">
      <h2>热门建议</h2><p>这里只展示一些常被搜索的词，不会记录任何用户的个人搜索行为。</p>
      <div class="search-suggest-chips">
        <button
          v-for="term in hot"
          :key="term"
          type="button"
          class="hot"
          @click="emit('select', term)"
        >
          {{ term }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-suggest{display:grid;gap:2rem;padding:1rem 0}.search-suggest-block__head{display:flex;justify-content:space-between}.search-suggest h2{font-size:1rem;font-weight:600}.search-suggest p,.search-suggest-block__head button{color:var(--site-muted);font-size:.72rem}.search-suggest-chips{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.8rem}.search-suggest-chips button{padding:.5rem .8rem;border:1px solid var(--site-line);border-radius:999px;font-size:.78rem}.search-suggest-chips .hot{background:var(--color-brand-50)}
</style>

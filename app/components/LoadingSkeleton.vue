<script setup lang="ts">
// 加载骨架屏：用于列表、卡片、详情等场景的内容占位。
// 通过 rows 控制骨架行数，variant 切换列表/卡片两种形态。
withDefaults(defineProps<{
  variant?: 'list' | 'card' | 'block'
  rows?: number
  label?: string
}>(), {
  variant: 'list',
  rows: 3,
  label: '加载中'
})
</script>

<template>
  <div
    class="state-loading"
    role="status"
    :aria-label="label"
  >
    <template v-if="variant === 'card'">
      <div
        v-for="n in rows"
        :key="n"
        class="state-loading__card"
      >
        <div class="state-loading__cover" />
        <div class="state-loading__lines">
          <span class="state-loading__line state-loading__line--short" />
          <span class="state-loading__line" />
          <span class="state-loading__line state-loading__line--long" />
        </div>
      </div>
    </template>
    <template v-else-if="variant === 'block'">
      <div
        v-for="n in rows"
        :key="n"
        class="state-loading__line state-loading__line--block"
      />
    </template>
    <template v-else>
      <div
        v-for="n in rows"
        :key="n"
        class="state-loading__row"
      >
        <span class="state-loading__thumb" />
        <span class="state-loading__lines">
          <span class="state-loading__line state-loading__line--short" />
          <span class="state-loading__line state-loading__line--long" />
        </span>
      </div>
    </template>
    <p class="state-loading__sr-only">
      {{ label }}
    </p>
  </div>
</template>

<style scoped>
.state-loading {
  display: grid;
  gap: 1rem;
}
.state-loading__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.state-loading__row {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: 1rem;
  align-items: center;
  padding: .8rem 0;
  border-bottom: 1px solid var(--site-line);
}
.state-loading__thumb,
.state-loading__cover,
.state-loading__line {
  display: block;
  background: linear-gradient(90deg, var(--site-line) 25%, color-mix(in srgb, var(--site-line) 40%, transparent) 37%, var(--site-line) 63%);
  background-size: 400% 100%;
  animation: state-loading-shimmer 1.4s ease infinite;
  border-radius: .35rem;
}
.state-loading__thumb {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: .35rem;
}
.state-loading__lines {
  display: grid;
  gap: .45rem;
}
.state-loading__line {
  height: .7rem;
}
.state-loading__line--short { width: 35%; }
.state-loading__line--long { width: 85%; }
.state-loading__line--block { height: 1rem; }
.state-loading__card {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--site-line);
  border-radius: .75rem;
  background: var(--site-surface);
}
.state-loading__cover {
  width: 7.5rem;
  aspect-ratio: 3 / 4;
  border-radius: .5rem;
}
.state-loading__card .state-loading__lines {
  padding-top: .5rem;
}
@keyframes state-loading-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .state-loading__thumb,
  .state-loading__cover,
  .state-loading__line {
    animation: none;
  }
}
</style>

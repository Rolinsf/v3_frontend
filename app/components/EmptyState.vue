<script setup lang="ts">
// 空状态：用于列表无数据、书架为空、搜索无结果等场景。
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
}>(), {
  icon: 'i-lucide-search-x',
  title: '暂时没有内容',
  description: ''
})
</script>

<template>
  <div
    class="state-empty"
    role="status"
  >
    <UIcon
      :name="icon"
      class="state-empty__icon"
      aria-hidden="true"
    />
    <h2 class="state-empty__title">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="state-empty__description"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="state-empty__actions"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .65rem;
  padding: 3rem 1.5rem;
  text-align: center;
}
.state-empty__icon {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--site-muted);
}
.state-empty__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}
.state-empty__description {
  margin: 0;
  max-width: 32rem;
  color: var(--site-muted);
  font-size: .85rem;
  line-height: 1.75;
}
.state-empty__actions {
  margin-top: .75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem;
}
</style>

<script setup lang="ts">
// 错误状态：用于请求失败、加载异常等场景。
// 支持自定义标题、描述和重试动作；retry 事件由父组件处理。
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  retryLabel?: string
}>(), {
  icon: 'i-lucide-circle-alert',
  title: '加载失败',
  description: '请稍后重试，或检查网络连接。',
  retryLabel: '重试'
})

defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="state-error"
    role="alert"
  >
    <UIcon
      :name="icon"
      class="state-error__icon"
      aria-hidden="true"
    />
    <h2 class="state-error__title">
      {{ title }}
    </h2>
    <p class="state-error__description">
      {{ description }}
    </p>
    <div
      v-if="$slots.default || retryLabel"
      class="state-error__actions"
    >
      <slot>
        <UButton
          v-if="retryLabel"
          :label="retryLabel"
          icon="i-lucide-rotate-cw"
          color="primary"
          variant="soft"
          @click="$emit('retry')"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .65rem;
  padding: 3rem 1.5rem;
  text-align: center;
}
.state-error__icon {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--site-warm);
}
.state-error__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}
.state-error__description {
  margin: 0;
  max-width: 32rem;
  color: var(--site-muted);
  font-size: .85rem;
  line-height: 1.75;
}
.state-error__actions {
  margin-top: .75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem;
}
</style>

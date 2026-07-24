<script setup lang="ts">
defineProps<{ content: string, hidden: boolean }>()
const emit = defineEmits<{ reveal: [] }>()
</script>

<template>
  <div
    v-if="hidden"
    class="spoiler-cover"
  >
    <UIcon name="i-lucide-eye-off" /><span>这条评论包含剧透</span>
    <button
      type="button"
      @click="emit('reveal')"
    >
      点击展开
    </button>
  </div>
  <p
    v-else
    class="comment-content"
  >
    {{ content }}
  </p>
</template>

<style scoped>
.comment-content{margin:.65rem 0;font-size:.86rem;line-height:1.8;white-space:pre-wrap}.spoiler-cover{display:flex;align-items:center;gap:.5rem;margin:.65rem 0;padding:.8rem;border:1px dashed var(--site-line);border-radius:.5rem;color:var(--site-muted);font-size:.78rem}.spoiler-cover button{margin-left:auto;color:var(--color-brand-700)}
</style>

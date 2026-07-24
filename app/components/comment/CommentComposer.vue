<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  error?: string
  spoiler?: boolean
  replyTo?: string
}>(), { error: '', spoiler: false, replyTo: '' })
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:spoiler': [value: boolean]
  'submit': []
  'cancel': []
}>()
</script>

<template>
  <form
    :class="replyTo ? 'reply-composer' : 'comment-composer'"
    @submit.prevent="emit('submit')"
  >
    <p v-if="replyTo">
      回复 {{ replyTo }}
    </p>
    <UTextarea
      :model-value="props.modelValue"
      :rows="replyTo ? 3 : 4"
      :placeholder="replyTo ? '写下回复…' : '友善交流，也给不同的阅读感受留一点空间。'"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <p
      v-if="error"
      class="comment-error"
    >
      {{ error }}
    </p>
    <div class="comment-composer__footer">
      <UCheckbox
        v-if="!replyTo"
        :model-value="props.spoiler"
        label="包含剧透，默认折叠"
        @update:model-value="emit('update:spoiler', Boolean($event))"
      />
      <span v-else />
      <div>
        <UButton
          label="取消"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="emit('cancel')"
        />
        <UButton
          type="submit"
          :label="replyTo ? '发送回复' : '发布评论'"
          size="sm"
        />
      </div>
    </div>
  </form>
</template>

<style scoped>
.comment-composer,.reply-composer{margin-top:1rem;padding:1rem;border:1px solid var(--site-line);border-radius:.75rem;background:var(--site-surface)}.comment-composer__footer{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.75rem}.comment-composer__footer>div{display:flex;justify-content:flex-end;gap:.4rem}.comment-error{color:#b84b4b;font-size:.72rem}.reply-composer>p{margin-bottom:.5rem;color:var(--site-muted);font-size:.72rem}@media(max-width:600px){.comment-composer__footer{align-items:flex-start;flex-direction:column}}
</style>

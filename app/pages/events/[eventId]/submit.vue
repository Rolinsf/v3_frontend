<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ middleware: ['auth'] }); const route = useRoute(); const admin = useAdmin(); const activity = computed(() => admin.data.value.activities.find(item => item.id === route.params.eventId)); const title = ref(''); const note = ref(''); const done = ref(false)
function submit() { if (!activity.value || !title.value.trim()) return; admin.submitActivity(activity.value.id); done.value = true }
</script>

<template>
  <main class="submit-page site-container">
    <template v-if="activity">
      <h1>投稿至「{{ activity.title }}」</h1><p>主题：{{ activity.theme }}</p><form
        v-if="!done"
        @submit.prevent="submit"
      >
        <UInput
          v-model="title"
          placeholder="作品标题或作品链接"
        /><UTextarea
          v-model="note"
          placeholder="投稿说明（可选）"
        /><UButton
          type="submit"
          label="确认投稿"
        />
      </form><EmptyState
        v-else
        icon="i-lucide-circle-check"
        title="投稿成功"
        description="你的投稿已加入本次活动。"
      >
        <UButton
          to="/events"
          label="返回活动中心"
        />
      </EmptyState>
    </template>
  </main>
</template>

<style scoped>
.submit-page{max-width:46rem;padding:2.5rem 0 5rem}.submit-page h1{font-size:1.7rem;font-weight:600}.submit-page>p{margin:.6rem 0 1.5rem;color:var(--site-muted)}form{display:grid;gap:1rem}
</style>

<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ middleware: ['auth'] })
useSeoMeta({ title: '创建活动｜若林轻小说' })
const auth = useAuthStore(); const admin = useAdmin(); const title = ref(''); const theme = ref(''); const summary = ref(''); const startAt = ref(''); const endAt = ref(''); const error = ref('')
function save() { try { admin.addActivity({ title: title.value, theme: theme.value, summary: summary.value, startAt: startAt.value, endAt: endAt.value, kind: 'community', enabled: true, creatorId: auth.user?.id, creatorName: auth.user?.name }); navigateTo('/events') } catch (cause) { error.value = cause instanceof Error ? cause.message : '创建失败' } }
</script>

<template>
  <main class="form-page site-container">
    <h1>创建社区活动</h1><p>提交后活动会出现在活动中心。正式后端接入后将增加审核流程。</p><form @submit.prevent="save">
      <UInput
        v-model="title"
        placeholder="活动名称"
      /><UInput
        v-model="theme"
        placeholder="活动主题"
      /><UTextarea
        v-model="summary"
        placeholder="活动说明"
      /><label>开始日期<UInput
        v-model="startAt"
        type="date"
      /></label><label>结束日期<UInput
        v-model="endAt"
        type="date"
      /></label><p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p><UButton
        type="submit"
        label="发布活动"
      />
    </form>
  </main>
</template>

<style scoped>
.form-page{max-width:46rem;padding:2.5rem 0 5rem}.form-page h1{font-size:2rem;font-weight:600}.form-page>p{margin:.5rem 0 1.5rem;color:var(--site-muted)}form{display:grid;gap:1rem}label{display:grid;gap:.4rem;font-size:.8rem}.error{color:#b84b4b}
</style>

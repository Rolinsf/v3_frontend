<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '活动管理｜若林轻小说' }); const admin = useAdmin(); const title = ref(''); const theme = ref(''); const summary = ref(''); const kind = ref<'monthly' | 'official'>('official'); const startAt = ref(''); const endAt = ref(''); const error = ref('')
function add() { try { admin.addActivity({ title: title.value, theme: theme.value, summary: summary.value, kind: kind.value, startAt: startAt.value, endAt: endAt.value, enabled: true }); title.value = ''; theme.value = ''; summary.value = ''; error.value = '' } catch (cause) { error.value = cause instanceof Error ? cause.message : '创建失败' } }
</script>

<template>
  <section class="admin-page">
    <header><p>CONTENT</p><h1>官方活动管理</h1><span>创建每月活动或官方自定义企划，并控制公开状态。</span></header><AdminSecurityNotice /><form @submit.prevent="add">
      <UInput
        v-model="title"
        placeholder="活动名称"
      /><UInput
        v-model="theme"
        placeholder="主题"
      /><UTextarea
        v-model="summary"
        placeholder="活动说明"
      /><USelect
        v-model="kind"
        :items="[{ label: '官方活动', value: 'official' }, { label: '每月活动', value: 'monthly' }]"
      /><UInput
        v-model="startAt"
        type="date"
      /><UInput
        v-model="endAt"
        type="date"
      /><p v-if="error">
        {{ error }}
      </p><UButton
        type="submit"
        label="新增活动"
      />
    </form><div class="list">
      <article
        v-for="item in admin.data.value.activities.filter(a => a.kind!=='community')"
        :key="item.id"
      >
        <div><strong>{{ item.title }}</strong><p>{{ item.theme }} · {{ item.startAt }}—{{ item.endAt }}</p></div><UButton
          :label="item.enabled?'停用':'启用'"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="admin.toggleActivity(item.id)"
        /><UButton
          label="删除"
          size="xs"
          color="error"
          variant="ghost"
          @click="admin.deleteActivity(item.id)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}form{display:grid;grid-template-columns:1fr 1fr 2fr 9rem 10rem 10rem auto;gap:.5rem;margin:1.25rem 0}.list{border:1px solid var(--site-line);border-radius:.7rem;background:var(--site-surface)}article{display:flex;align-items:center;gap:.5rem;padding:.8rem 1rem;border-bottom:1px solid var(--site-line)}article:last-child{border:0}article>div{flex:1}article p{color:var(--site-muted);font-size:.7rem}@media(max-width:1000px){form{grid-template-columns:1fr 1fr}article{flex-wrap:wrap}}
</style>

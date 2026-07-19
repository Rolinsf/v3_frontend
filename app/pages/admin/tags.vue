<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '标签管理｜若林轻小说' }); const admin = useAdmin(); const name = ref(''); const slug = ref(''); const error = ref(''); function add() { try { admin.addTag(name.value, slug.value); name.value = ''; slug.value = ''; error.value = '' } catch (e) { error.value = e instanceof Error ? e.message : '创建失败' } }
</script>

<template>
  <section class="admin-page">
    <header><p>CONFIGURATION</p><h1>标签管理</h1><span>标签是扁平的内容特征，可多选，但不替代分类。</span></header><AdminSecurityNotice /><p
      v-if="error"
      class="admin-error"
    >
      {{ error }}
    </p><form
      class="tag-create"
      @submit.prevent="add"
    >
      <UInput
        v-model="name"
        placeholder="标签名称"
      /><UInput
        v-model="slug"
        placeholder="slug"
      /><UButton
        type="submit"
        label="新增标签"
      />
    </form><div class="admin-table">
      <div class="admin-table__head">
        <span>名称</span><span>Slug</span><span>作品数</span><span>状态</span><span>操作</span>
      </div><div
        v-for="tag in admin.data.value.tags"
        :key="tag.id"
        class="admin-table__row"
      >
        <strong>{{ tag.name }}</strong><code>{{ tag.slug }}</code><span>{{ tag.novelCount }}</span><span>{{ tag.enabled?'启用':'停用' }}</span><UButton
          :label="tag.enabled?'停用':'启用'"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="admin.toggleTag(tag.id)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span,.admin-table span,.admin-table code{color:var(--site-muted);font-size:.72rem}.admin-error{color:#b84b4b}.tag-create{display:flex;gap:.5rem;max-width:35rem;margin-bottom:1rem}.admin-table{border:1px solid var(--site-line);border-radius:.7rem;background:var(--site-surface)}.admin-table__head,.admin-table__row{display:grid;grid-template-columns:1fr 1fr .5fr .5fr auto;gap:1rem;align-items:center;padding:.75rem 1rem;border-bottom:1px solid var(--site-line)}.admin-table__head{font-size:.7rem}.admin-table__row:last-child{border:0}@media(max-width:650px){.tag-create{flex-direction:column}.admin-table__head{display:none}.admin-table__row{grid-template-columns:1fr 1fr}.admin-table__row button{justify-self:start}}
</style>

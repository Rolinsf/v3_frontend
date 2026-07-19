<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '分类管理｜若林轻小说' }); const admin = useAdmin(); const primaryName = ref(''); const primarySlug = ref(''); const childDraft = reactive<Record<string, { name: string, slug: string }>>({}); const error = ref('')
function addPrimary() { try { admin.addPrimary(primaryName.value, primarySlug.value); primaryName.value = ''; primarySlug.value = ''; error.value = '' } catch (e) { error.value = e instanceof Error ? e.message : '创建失败' } }
function addChild(id: string) { const draft = childDraft[id]; if (!draft) return; try { admin.addSecondary(id, draft.name, draft.slug); draft.name = ''; draft.slug = ''; error.value = '' } catch (e) { error.value = e instanceof Error ? e.message : '创建失败' } }
function childValue(id: string, field: 'name' | 'slug') { return childDraft[id]?.[field] ?? '' }
function setChildValue(id: string, field: 'name' | 'slug', value: string) { childDraft[id] = { ...(childDraft[id] ?? { name: '', slug: '' }), [field]: value } }
</script>

<template>
  <section class="admin-page">
    <header><p>CONFIGURATION</p><h1>两级分类管理</h1><span>仅允许一级分类及其直属二级分类。</span></header><AdminSecurityNotice /><p
      v-if="error"
      class="admin-error"
    >
      {{ error }}
    </p><form
      class="category-create"
      @submit.prevent="addPrimary"
    >
      <UInput
        v-model="primaryName"
        placeholder="一级分类名称"
      /><UInput
        v-model="primarySlug"
        placeholder="slug"
      /><UButton
        type="submit"
        label="新增一级分类"
      />
    </form><div class="category-admin-tree">
      <section
        v-for="primary in admin.data.value.categories"
        :key="primary.id"
      >
        <header>
          <div><strong>{{ primary.name }}</strong><code>{{ primary.slug }}</code><span>{{ primary.novelCount||0 }} 部作品</span></div><UButton
            :label="primary.enabled?'停用':'启用'"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="admin.toggleCategory(primary.id)"
          />
        </header><div
          v-for="child in primary.children"
          :key="child.id"
          class="category-child"
        >
          <span>└</span><strong>{{ child.name }}</strong><code>{{ child.slug }}</code><small>{{ child.novelCount||0 }} 部</small><UButton
            :label="child.enabled?'停用':'启用'"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="admin.toggleCategory(child.id)"
          />
        </div><form
          class="child-create"
          @submit.prevent="addChild(primary.id)"
        >
          <UInput
            :model-value="childValue(primary.id, 'name')"
            placeholder="二级分类名称"
            size="sm"
            @update:model-value="setChildValue(primary.id, 'name', $event)"
          /><UInput
            :model-value="childValue(primary.id, 'slug')"
            placeholder="slug"
            size="sm"
            @update:model-value="setChildValue(primary.id, 'slug', $event)"
          /><UButton
            type="submit"
            label="添加二级分类"
            size="sm"
            color="neutral"
            variant="outline"
          />
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}.admin-error{margin-bottom:1rem;color:#b84b4b;font-size:.75rem}.category-create,.child-create{display:flex;gap:.5rem;margin-bottom:1rem}.category-admin-tree{display:grid;gap:1rem}.category-admin-tree>section{border:1px solid var(--site-line);border-radius:.7rem;background:var(--site-surface)}.category-admin-tree>section>header{display:flex;justify-content:space-between;padding:.8rem 1rem;border-bottom:1px solid var(--site-line)}.category-admin-tree header div,.category-child{display:flex;align-items:center;gap:.7rem}.category-admin-tree code,.category-admin-tree span,.category-admin-tree small{color:var(--site-muted);font-size:.68rem}.category-child{padding:.65rem 1rem;border-bottom:1px solid var(--site-line)}.category-child button{margin-left:auto}.child-create{padding:.8rem 1rem;margin:0}@media(max-width:650px){.category-create,.child-create{flex-direction:column}.category-child{flex-wrap:wrap}}
</style>

<script setup lang="ts">
import type { DiscoveryItem, DiscoveryItemType } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
useSeoMeta({ title: '首页标签云｜若林轻小说' })

const admin = useAdmin()
const editingId = ref<string | null>(null)
const error = ref('')
const draft = reactive<{
  label: string
  url: string
  type: DiscoveryItemType
  emphasis: 1 | 2 | 3
  order: number
  enabled: boolean
}>({ label: '', url: '', type: 'author', emphasis: 2, order: 10, enabled: true })

const orderedItems = computed(() => [...admin.data.value.discoveryItems].sort((a, b) => a.order - b.order))
const typeOptions = [
  { label: '作者', value: 'author' },
  { label: '作品分类', value: 'category' },
  { label: '作品标签', value: 'tag' }
]
const emphasisOptions = [
  { label: '普通', value: 1 },
  { label: '突出', value: 2 },
  { label: '重点', value: 3 }
]

function resetDraft() {
  editingId.value = null
  Object.assign(draft, { label: '', url: '', type: 'author', emphasis: 2, order: 10, enabled: true })
  error.value = ''
}

function edit(item: DiscoveryItem) {
  editingId.value = item.id
  Object.assign(draft, item)
  error.value = ''
}

function save() {
  try {
    const input = { ...draft, order: Number(draft.order), emphasis: Number(draft.emphasis) as 1 | 2 | 3 }
    if (editingId.value) admin.updateDiscoveryItem(editingId.value, input)
    else admin.addDiscoveryItem(input)
    resetDraft()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '保存失败'
  }
}

function remove(item: DiscoveryItem) {
  if (confirm(`确定删除“${item.label}”吗？`)) admin.deleteDiscoveryItem(item.id)
}

function typeLabel(type: DiscoveryItemType) {
  return typeOptions.find(option => option.value === type)?.label ?? type
}
</script>

<template>
  <section class="admin-page">
    <header>
      <p>HOMEPAGE</p>
      <h1>首页标签云</h1>
      <span>独立维护推荐轮播下方的作者、作品分类和标签入口；不会修改上方编辑推荐。</span>
    </header>
    <AdminSecurityNotice />

    <section class="discovery-editor">
      <h2>{{ editingId ? '编辑条目' : '新增条目' }}</h2>
      <p
        v-if="error"
        class="admin-error"
      >
        {{ error }}
      </p>
      <form
        class="discovery-form"
        @submit.prevent="save"
      >
        <UInput
          v-model="draft.label"
          placeholder="显示名称"
        />
        <UInput
          v-model="draft.url"
          placeholder="链接，如 /users/userId"
        />
        <USelect
          v-model="draft.type"
          :items="typeOptions"
        />
        <USelect
          v-model="draft.emphasis"
          :items="emphasisOptions"
        />
        <UInput
          v-model.number="draft.order"
          type="number"
          placeholder="排序"
        />
        <UCheckbox
          v-model="draft.enabled"
          label="启用"
        />
        <UButton
          type="submit"
          :label="editingId ? '保存修改' : '新增条目'"
        />
        <UButton
          v-if="editingId"
          label="取消"
          color="neutral"
          variant="ghost"
          @click="resetDraft"
        />
      </form>
    </section>

    <section class="discovery-list">
      <div class="admin-table__head">
        <span>名称</span><span>类型</span><span>链接</span><span>强调</span><span>排序</span><span>状态</span><span>操作</span>
      </div>
      <div
        v-for="item in orderedItems"
        :key="item.id"
        class="admin-table__row"
      >
        <strong>{{ item.label }}</strong>
        <span>{{ typeLabel(item.type) }}</span>
        <code>{{ item.url }}</code>
        <span>{{ item.emphasis }}</span>
        <span>{{ item.order }}</span>
        <span>{{ item.enabled ? '启用' : '停用' }}</span>
        <div class="admin-table__actions">
          <UButton
            label="编辑"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="edit(item)"
          />
          <UButton
            :label="item.enabled ? '停用' : '启用'"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="admin.toggleDiscoveryItem(item.id)"
          />
          <UButton
            label="删除"
            size="xs"
            color="error"
            variant="ghost"
            @click="remove(item)"
          />
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.admin-page > header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }
.admin-page h1 { margin: .3rem 0; font-size: 1.8rem; font-weight: 600; }
.admin-page > header span, .admin-table__row span, .admin-table__row code { color: var(--site-muted); font-size: .72rem; }
.admin-page h2 { margin: 0 0 .8rem; font-size: 1rem; font-weight: 600; }
.discovery-editor, .discovery-list { margin-top: 1.25rem; padding: 1.25rem; border: 1px solid var(--site-line); border-radius: .7rem; background: var(--site-surface); }
.discovery-form { display: grid; grid-template-columns: 1fr 1.4fr .7fr .65fr 6rem auto auto auto; gap: .55rem; align-items: center; }
.admin-error { color: #b84b4b; font-size: .75rem; }
.admin-table__head, .admin-table__row { display: grid; grid-template-columns: .8fr .55fr 1.4fr .4fr .4fr .5fr 1.3fr; gap: .75rem; align-items: center; padding: .75rem; border-bottom: 1px solid var(--site-line); }
.admin-table__head { color: var(--site-muted); font-size: .7rem; }
.admin-table__row:last-child { border-bottom: 0; }
.admin-table__actions { display: flex; justify-content: flex-end; gap: .2rem; }
@media (max-width: 1100px) {
  .discovery-form { grid-template-columns: 1fr 1fr; }
  .admin-table__head { display: none; }
  .admin-table__row { grid-template-columns: 1fr 1fr; }
  .admin-table__actions { justify-content: flex-start; }
}
</style>

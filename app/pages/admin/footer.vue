<script setup lang="ts">
import type { FooterLink } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
useSeoMeta({ title: '页脚管理｜若林轻小说' })

const admin = useAdmin()
const copyright = ref(admin.data.value.footer.copyright)
const secondaryText = ref(admin.data.value.footer.secondaryText)
const editingId = ref<string | null>(null)
const error = ref('')
const draft = reactive({ label: '', url: '', order: 10, enabled: true })

const orderedLinks = computed(() => [...admin.data.value.footer.links].sort((a, b) => a.order - b.order))

function saveSettings() {
  admin.saveFooterSettings({ copyright: copyright.value, secondaryText: secondaryText.value })
}

function resetDraft() {
  editingId.value = null
  Object.assign(draft, { label: '', url: '', order: 10, enabled: true })
  error.value = ''
}

function edit(link: FooterLink) {
  editingId.value = link.id
  Object.assign(draft, { label: link.label, url: link.url, order: link.order, enabled: link.enabled })
  error.value = ''
}

function saveLink() {
  try {
    const input = { label: draft.label, url: draft.url, order: Number(draft.order), enabled: draft.enabled }
    if (editingId.value) admin.updateFooterLink(editingId.value, input)
    else admin.addFooterLink(input)
    resetDraft()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '保存失败'
  }
}

function remove(link: FooterLink) {
  if (confirm(`确定删除页脚链接“${link.label}”吗？`)) admin.deleteFooterLink(link.id)
}
</script>

<template>
  <section class="admin-page">
    <header>
      <p>CONFIGURATION</p>
      <h1>页脚管理</h1>
      <span>维护公开站点页脚的导航链接、顺序、状态和版权信息。</span>
    </header>
    <AdminSecurityNotice />

    <section class="footer-settings">
      <h2>基础信息</h2>
      <div class="footer-settings__fields">
        <UInput
          v-model="copyright"
          placeholder="版权信息"
        />
        <UInput
          v-model="secondaryText"
          placeholder="补充说明或备案信息"
        />
        <UButton
          label="保存基础信息"
          @click="saveSettings"
        />
      </div>
    </section>

    <section class="footer-links">
      <h2>{{ editingId ? '编辑链接' : '新增链接' }}</h2>
      <p
        v-if="error"
        class="admin-error"
      >
        {{ error }}
      </p>
      <form
        class="footer-link-form"
        @submit.prevent="saveLink"
      >
        <UInput
          v-model="draft.label"
          placeholder="显示名称"
        />
        <UInput
          v-model="draft.url"
          placeholder="链接地址，如 /about"
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
          :label="editingId ? '保存修改' : '新增链接'"
        />
        <UButton
          v-if="editingId"
          label="取消"
          color="neutral"
          variant="ghost"
          @click="resetDraft"
        />
      </form>

      <div class="admin-table">
        <div class="admin-table__head">
          <span>名称</span><span>地址</span><span>排序</span><span>状态</span><span>操作</span>
        </div>
        <div
          v-for="link in orderedLinks"
          :key="link.id"
          class="admin-table__row"
        >
          <strong>{{ link.label }}</strong>
          <code>{{ link.url }}</code>
          <span>{{ link.order }}</span>
          <span>{{ link.enabled ? '启用' : '停用' }}</span>
          <div class="admin-table__actions">
            <UButton
              label="编辑"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="edit(link)"
            />
            <UButton
              :label="link.enabled ? '停用' : '启用'"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="admin.toggleFooterLink(link.id)"
            />
            <UButton
              label="删除"
              size="xs"
              color="error"
              variant="ghost"
              @click="remove(link)"
            />
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.admin-page > header p { color: var(--color-brand-700); font-size: .65rem; letter-spacing: .15em; }
.admin-page h1 { margin: .3rem 0; font-size: 1.8rem; font-weight: 600; }
.admin-page > header span, .admin-table span, .admin-table code { color: var(--site-muted); font-size: .72rem; }
.admin-page h2 { margin: 0 0 .8rem; font-size: 1rem; font-weight: 600; }
.footer-settings, .footer-links { margin-top: 1.25rem; padding: 1.25rem; border: 1px solid var(--site-line); border-radius: .7rem; background: var(--site-surface); }
.footer-settings__fields, .footer-link-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: .6rem; align-items: center; }
.footer-link-form { grid-template-columns: 1fr 1.4fr 7rem auto auto auto; margin-bottom: 1rem; }
.admin-error { color: #b84b4b; font-size: .75rem; }
.admin-table { overflow: hidden; border: 1px solid var(--site-line); border-radius: .7rem; }
.admin-table__head, .admin-table__row { display: grid; grid-template-columns: 1fr 1.5fr .45fr .55fr 1.3fr; gap: 1rem; align-items: center; padding: .75rem 1rem; border-bottom: 1px solid var(--site-line); }
.admin-table__head { font-size: .7rem; }
.admin-table__row:last-child { border-bottom: 0; }
.admin-table__actions { display: flex; justify-content: flex-end; gap: .2rem; }
@media (max-width: 900px) {
  .footer-settings__fields, .footer-link-form { grid-template-columns: 1fr; }
  .admin-table__head { display: none; }
  .admin-table__row { grid-template-columns: 1fr 1fr; }
  .admin-table__actions { justify-content: flex-start; }
}
</style>

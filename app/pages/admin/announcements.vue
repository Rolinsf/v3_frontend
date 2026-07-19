<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '公告管理｜若林轻小说' }); const admin = useAdmin(); const title = ref(''); const content = ref(''); function add() { if (!title.value.trim() || !content.value.trim()) return; admin.addAnnouncement({ title: title.value, content: content.value, publishedAt: new Date().toISOString(), enabled: true }); title.value = ''; content.value = '' }
</script>

<template>
  <section class="admin-page">
    <header><p>NOTICE</p><h1>公告管理</h1><span>维护顶部公告弹窗中公开展示的内容。</span></header><AdminSecurityNotice /><form @submit.prevent="add">
      <UInput
        v-model="title"
        placeholder="公告标题"
      /><UTextarea
        v-model="content"
        placeholder="公告内容"
      /><UButton
        type="submit"
        label="发布公告"
      />
    </form><div class="list">
      <article
        v-for="item in admin.data.value.announcements"
        :key="item.id"
      >
        <div><strong>{{ item.title }}</strong><p>{{ item.content }}</p><time>{{ item.publishedAt.slice(0, 10) }}</time></div><UButton
          :label="item.enabled?'停用':'启用'"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="admin.toggleAnnouncement(item.id)"
        /><UButton
          label="删除"
          size="xs"
          color="error"
          variant="ghost"
          @click="admin.deleteAnnouncement(item.id)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}form{display:grid;grid-template-columns:1fr 2fr auto;gap:.5rem;margin:1.25rem 0}.list{border:1px solid var(--site-line);border-radius:.7rem;background:var(--site-surface)}article{display:flex;align-items:center;gap:.5rem;padding:1rem;border-bottom:1px solid var(--site-line)}article:last-child{border:0}article>div{flex:1}article p,article time{display:block;color:var(--site-muted);font-size:.72rem}@media(max-width:800px){form{grid-template-columns:1fr}article{flex-wrap:wrap}}
</style>

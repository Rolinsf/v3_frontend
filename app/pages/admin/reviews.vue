<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '内容审核｜若林轻小说' }); const admin = useAdmin()
</script>

<template>
  <section class="admin-page">
    <header><p>MODERATION</p><h1>内容审核</h1><span>审核投稿作品和章节；后端仍需验证状态迁移与操作者权限。</span></header><AdminSecurityNotice /><EmptyState
      v-if="!admin.data.value.reviews.some(i => i.status==='pending')"
      icon="i-lucide-badge-check"
      title="没有待审核内容"
      description="新的投稿会出现在这里。"
    /><div class="moderation-list">
      <article
        v-for="item in admin.data.value.reviews.filter(i => i.status==='pending')"
        :key="item.id"
      >
        <div><span>{{ item.type==='novel'?'作品':'章节' }}</span><h2>{{ item.title }}</h2><p>{{ item.authorName }} · {{ new Date(item.submittedAt).toLocaleString('zh-CN') }}</p></div><div>
          <UButton
            label="驳回"
            color="error"
            variant="ghost"
            @click="admin.review(item.id, 'rejected')"
          /><UButton
            label="通过"
            icon="i-lucide-check"
            @click="admin.review(item.id, 'approved')"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}.moderation-list{display:grid}.moderation-list article{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--site-line)}.moderation-list span,.moderation-list p{color:var(--site-muted);font-size:.7rem}.moderation-list h2{margin:.2rem 0;font-weight:600}.moderation-list article>div:last-child{display:flex;gap:.4rem}
</style>

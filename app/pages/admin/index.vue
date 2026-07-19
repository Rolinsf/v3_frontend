<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '管理概览｜若林轻小说' }); const admin = useAdmin()
</script>

<template>
  <section class="admin-page">
    <header><p>ADMIN CONSOLE</p><h1>管理概览</h1><span>只展示 MVP 所需的治理入口。</span></header><AdminSecurityNotice /><div class="admin-metrics">
      <NuxtLink to="/admin/reviews"><UIcon name="i-lucide-shield-check" /><strong>{{ admin.pendingReviews.value }}</strong><span>待审核内容</span></NuxtLink><NuxtLink to="/admin/reports"><UIcon name="i-lucide-flag" /><strong>{{ admin.pendingReports.value }}</strong><span>待处理举报</span></NuxtLink><NuxtLink to="/admin/categories"><UIcon name="i-lucide-folder-tree" /><strong>{{ admin.data.value.categories.length }}</strong><span>一级分类</span></NuxtLink><NuxtLink to="/admin/bans"><UIcon name="i-lucide-user-x" /><strong>{{ admin.data.value.users.filter(u => u.banned).length }}</strong><span>已封禁用户</span></NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}.admin-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.admin-metrics a{display:grid;gap:.35rem;padding:1.1rem;border:1px solid var(--site-line);border-radius:.7rem;background:var(--site-surface)}.admin-metrics svg{color:var(--color-brand-600)}.admin-metrics strong{font-size:1.7rem}.admin-metrics span{color:var(--site-muted);font-size:.72rem}@media(max-width:800px){.admin-metrics{grid-template-columns:repeat(2,1fr)}}
</style>

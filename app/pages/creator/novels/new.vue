<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'creator', middleware: ['auth'] }); useSeoMeta({ title: '创建作品｜若林轻小说' }); function saved(id: string) { navigateTo(`/creator/novels/${id}/chapters`) }
</script>

<template>
  <main class="creator-edit-page">
    <div class="site-container creator-edit-shell">
      <header><NuxtLink to="/creator">← 返回我的作品</NuxtLink><h1>创建作品</h1><p>先建立清晰的分类与简介，内容可以稍后继续完善。</p></header><EditorNovelForm @saved="saved" />
    </div>
  </main>
</template>

<style scoped>
.creator-edit-page{padding:2rem 0 5rem}.creator-edit-shell{max-width:900px}.creator-edit-shell header{margin-bottom:2rem}.creator-edit-shell header a,.creator-edit-shell header p{color:var(--site-muted);font-size:.75rem}.creator-edit-shell h1{margin:.6rem 0 .3rem;font:600 2rem var(--font-reading)}
</style>

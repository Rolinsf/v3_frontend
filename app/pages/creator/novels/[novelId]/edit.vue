<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'creator', middleware: ['auth'] }); const route = useRoute(); const auth = useAuthStore(); const creator = useCreator(); const novel = creator.getNovel(String(route.params.novelId), auth.user?.id ?? ''); useSeoMeta({ title: '编辑作品｜若林轻小说' }); function saved(id: string) { navigateTo(`/creator/novels/${id}/chapters`) }
</script>

<template>
  <main class="creator-edit-page">
    <div class="site-container creator-edit-shell">
      <header><NuxtLink to="/creator">← 返回我的作品</NuxtLink><h1>编辑作品资料</h1></header><LoadingSkeleton v-if="!creator.initialized.value" /><EmptyState
        v-else-if="!novel"
        icon="i-lucide-file-question"
        title="没有找到这部作品"
        description="作品可能已被删除，或不属于当前账号。"
        action-label="返回我的作品"
        action-to="/creator"
      /><EditorNovelForm
        v-else
        :novel="novel"
        @saved="saved"
      />
    </div>
  </main>
</template>

<style scoped>
.creator-edit-page{padding:2rem 0 5rem}.creator-edit-shell{max-width:900px}.creator-edit-shell header{margin-bottom:2rem}.creator-edit-shell header a{color:var(--site-muted);font-size:.75rem}.creator-edit-shell h1{margin-top:.6rem;font:600 2rem var(--font-reading)}
</style>

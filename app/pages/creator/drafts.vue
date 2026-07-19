<script setup lang="ts">
definePageMeta({ layout: 'creator', middleware: ['auth'] })
useSeoMeta({ title: '草稿箱｜若林轻小说' })
const auth = useAuthStore()
const creator = useCreator()
const items = computed(() => creator.drafts.value.map(draft => ({ draft, novel: creator.novels.value.find(novel => novel.id === draft.novelId && novel.ownerId === auth.user?.id) })).filter(item => item.novel).sort((a, b) => b.draft.savedAt.localeCompare(a.draft.savedAt)))
</script>

<template>
  <main class="draft-page">
    <div class="site-container draft-shell">
      <header><div><NuxtLink to="/creator">← 创作中心</NuxtLink><h1>草稿箱</h1><p>自动保存的章节会留在这里，直到成功发布。</p></div></header><EmptyState
        v-if="items.length === 0"
        icon="i-lucide-file-check"
        title="没有待恢复的草稿"
        description="编辑章节时，内容会自动保存到草稿箱。"
      /><div
        v-else
        class="draft-list"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.draft.chapterId"
          :to="`/creator/novels/${item.draft.novelId}/chapters/${item.draft.chapterId}/edit`"
        ><div><span>{{ item.novel!.title }}</span><h2>{{ item.draft.title || '未命名章节' }}</h2><p>{{ item.draft.plainText.length.toLocaleString('zh-CN') }} 字 · 保存于 {{ new Date(item.draft.savedAt).toLocaleString('zh-CN') }}</p></div><UIcon name="i-lucide-arrow-right" /></NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.draft-page{padding:2rem 0 5rem}.draft-shell{max-width:800px}.draft-shell>header{padding-bottom:1rem;border-bottom:1px solid var(--site-line)}.draft-shell header a,.draft-shell header p{color:var(--site-muted);font-size:.72rem}.draft-shell h1{margin:.5rem 0 .2rem;font:600 2rem var(--font-reading)}.draft-list{display:grid}.draft-list>a{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;border-bottom:1px solid var(--site-line)}.draft-list span,.draft-list p{color:var(--site-muted);font-size:.68rem}.draft-list h2{margin:.2rem 0;font-size:.9rem;font-weight:600}
</style>

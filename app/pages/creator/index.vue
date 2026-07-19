<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'creator', middleware: ['auth'] })
useSeoMeta({ title: '创作中心｜若林轻小说' })
const auth = useAuthStore(); const creator = useCreator(); const works = creator.ownedNovels(auth.user?.id ?? '')
function words(novel: typeof works.value[number]) { return novel.volumes.flatMap(v => v.chapters).reduce((sum, ch) => sum + ch.plainText.length, 0) }
</script>

<template>
  <main class="creator-page">
    <div class="site-container creator-shell">
      <header class="creator-heading">
        <div><p>WRITER'S DESK</p><h1>我的作品</h1><span>整理故事、卷章和还没写完的念头。</span></div><div class="creator-heading__actions">
          <UButton
            to="/creator/drafts"
            label="草稿箱"
            icon="i-lucide-files"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="/creator/novels/new"
            label="创建作品"
            icon="i-lucide-plus"
          />
        </div>
      </header><EmptyState
        v-if="works.length===0"
        icon="i-lucide-feather"
        title="写下第一部作品"
        description="先建立作品资料，再慢慢整理卷章。"
        action-label="创建作品"
        action-to="/creator/novels/new"
      /><div
        v-else
        class="creator-work-list"
      >
        <article
          v-for="novel in works"
          :key="novel.id"
        >
          <div class="creator-work-cover">
            <img
              v-if="novel.coverDataUrl"
              :src="novel.coverDataUrl"
              :alt="`${novel.title}封面`"
            ><UIcon
              v-else
              name="i-lucide-book-open"
            />
          </div><div><span>{{ novel.status==='draft'?'草稿':novel.status==='serializing'?'连载中':'已完结' }}</span><h2>{{ novel.title }}</h2><p>{{ words(novel).toLocaleString('zh-CN') }} 字 · {{ novel.volumes.length }} 卷 · {{ novel.volumes.flatMap(v => v.chapters).length }} 章</p></div><div class="creator-work-actions">
            <UButton
              :to="`/creator/novels/${novel.id}/chapters`"
              label="管理卷章"
              color="neutral"
              variant="outline"
            /><UButton
              :to="`/creator/novels/${novel.id}/edit`"
              label="编辑资料"
              color="neutral"
              variant="ghost"
            />
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.creator-page{padding:3rem 0 5rem}.creator-shell{max-width:980px}.creator-heading{display:flex;align-items:end;justify-content:space-between;padding-bottom:1.2rem;border-bottom:1px solid var(--site-line)}.creator-heading p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.creator-heading h1{font:600 2.5rem var(--font-reading)}.creator-heading span{color:var(--site-muted);font-size:.75rem}.creator-work-list{display:grid}.creator-work-list article{display:grid;grid-template-columns:4.5rem minmax(0,1fr) auto;gap:1rem;align-items:center;padding:1.2rem 0;border-bottom:1px solid var(--site-line)}.creator-work-cover{display:grid;place-items:center;aspect-ratio:3/4;overflow:hidden;border-radius:.5rem;background:var(--color-brand-100);color:var(--color-brand-700)}.creator-work-cover img{width:100%;height:100%;object-fit:cover}.creator-work-list h2{font-weight:600}.creator-work-list p,.creator-work-list span{color:var(--site-muted);font-size:.7rem}.creator-work-actions{display:flex;gap:.4rem}@media(max-width:650px){.creator-heading{align-items:start;gap:1rem}.creator-work-list article{grid-template-columns:3.5rem 1fr}.creator-work-actions{grid-column:2;flex-wrap:wrap}}
</style>

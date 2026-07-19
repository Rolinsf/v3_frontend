<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'creator', middleware: ['auth'] }); useSeoMeta({ title: '卷章管理｜若林轻小说' })
const route = useRoute(); const auth = useAuthStore(); const creator = useCreator(); const novelId = String(route.params.novelId); const novel = creator.getNovel(novelId, auth.user?.id ?? ''); const volumeTitle = ref('')
function addVolume() { if (!auth.user || !volumeTitle.value.trim()) return; creator.addVolume(novelId, auth.user.id, volumeTitle.value.trim()); volumeTitle.value = '' }
function addChapter(volumeId: string) { if (!auth.user) return; const id = creator.addChapter(novelId, volumeId, auth.user.id); navigateTo(`/creator/novels/${novelId}/chapters/${id}/edit`) }
</script>

<template>
  <main class="chapter-manager">
    <div class="site-container chapter-manager__shell">
      <header>
        <div><NuxtLink to="/creator">← 我的作品</NuxtLink><h1>{{ novel?.title||'卷章管理' }}</h1><p>按卷整理章节；复杂调整建议使用桌面端。</p></div><UButton
          :to="`/creator/novels/${novelId}/edit`"
          label="编辑作品资料"
          color="neutral"
          variant="outline"
        />
      </header><LoadingSkeleton v-if="!creator.initialized.value" /><EmptyState
        v-else-if="!novel"
        icon="i-lucide-file-question"
        title="没有找到这部作品"
        description="作品可能已被删除，或不属于当前账号。"
        action-label="返回我的作品"
        action-to="/creator"
      /><template v-else>
        <div class="volume-add">
          <UInput
            v-model="volumeTitle"
            placeholder="新卷名称"
          /><UButton
            label="添加卷"
            icon="i-lucide-folder-plus"
            color="neutral"
            variant="outline"
            @click="addVolume"
          />
        </div><div class="volume-tree">
          <section
            v-for="volume in novel.volumes"
            :key="volume.id"
          >
            <header>
              <div><UIcon name="i-lucide-folder" /><h2>{{ volume.title }}</h2><span>{{ volume.chapters.length }} 章</span></div><UButton
                label="新增章节"
                icon="i-lucide-file-plus"
                size="sm"
                @click="addChapter(volume.id)"
              />
            </header><EmptyState
              v-if="!volume.chapters.length"
              icon="i-lucide-file-text"
              title="这一卷还没有章节"
              description="创建一章，开始写作。"
            /><NuxtLink
              v-for="(chapter, index) in volume.chapters"
              :key="chapter.id"
              :to="`/creator/novels/${novelId}/chapters/${chapter.id}/edit`"
              class="chapter-manage-row"
            ><span>{{ index+1 }}</span><div><strong>{{ chapter.title }}</strong><p>{{ chapter.plainText.length.toLocaleString('zh-CN') }} 字 · {{ chapter.status==='published'?'已发布':'草稿' }}</p></div><UIcon name="i-lucide-chevron-right" /></NuxtLink>
          </section>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.chapter-manager{padding:2rem 0 5rem}.chapter-manager__shell{max-width:900px}.chapter-manager__shell>header{display:flex;justify-content:space-between;align-items:end;padding-bottom:1.2rem;border-bottom:1px solid var(--site-line)}.chapter-manager__shell>header a,.chapter-manager__shell>header p{color:var(--site-muted);font-size:.72rem}.chapter-manager h1{margin:.4rem 0 .2rem;font:600 2rem var(--font-reading)}.volume-add{display:flex;gap:.5rem;max-width:25rem;margin:1.5rem 0}.volume-tree{display:grid;gap:1.25rem}.volume-tree>section{overflow:hidden;border:1px solid var(--site-line);border-radius:.75rem;background:var(--site-surface)}.volume-tree>section>header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1rem;border-bottom:1px solid var(--site-line)}.volume-tree>section>header>div{display:flex;align-items:center;gap:.5rem}.volume-tree h2{font-weight:600}.volume-tree header span{color:var(--site-muted);font-size:.7rem}.chapter-manage-row{display:grid;grid-template-columns:2rem 1fr auto;align-items:center;gap:.75rem;padding:.8rem 1rem;border-bottom:1px solid var(--site-line)}.chapter-manage-row:last-child{border:0}.chapter-manage-row>span{color:var(--site-muted);font-size:.7rem}.chapter-manage-row strong{font-size:.85rem}.chapter-manage-row p{color:var(--site-muted);font-size:.68rem}
</style>

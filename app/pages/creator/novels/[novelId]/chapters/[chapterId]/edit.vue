<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
import { useDebounceFn } from '@vueuse/core'
import type { JSONContent } from '@tiptap/vue-3'
import { chapterDraftSchema, schemaErrors } from '~/schemas/creator'

definePageMeta({ layout: 'creator', middleware: ['auth'] }); useSeoMeta({ title: '章节编辑｜若林轻小说' })
const route = useRoute(); const auth = useAuthStore(); const creator = useCreator(); const novelId = String(route.params.novelId); const chapterId = String(route.params.chapterId); const novel = creator.getNovel(novelId, auth.user?.id ?? '')
const volume = computed(() => novel.value?.volumes.find(v => v.chapters.some(c => c.id === chapterId))); const chapter = computed(() => volume.value?.chapters.find(c => c.id === chapterId))
const title = ref(''); const content = ref<JSONContent>({ type: 'doc', content: [{ type: 'paragraph' }] }); const plainText = ref(''); const authorNote = ref(''); const dirty = ref(false); const saveState = ref<'saved' | 'saving' | 'error'>('saved'); const recovered = ref(false); const previewOpen = ref(false); const publishError = ref(''); const errors = ref<Record<string, string>>({}); let loaded = false

onMounted(() => { creator.initialize() })
watch(chapter, (value) => { if (!value || loaded) return; const draft = creator.drafts.value.find(item => item.chapterId === chapterId); const source = draft && draft.savedAt > value.updatedAt ? draft : value; title.value = source.title; content.value = JSON.parse(JSON.stringify(source.content)) as JSONContent; plainText.value = source.plainText; authorNote.value = source.authorNote; recovered.value = source === draft; loaded = true }, { immediate: true })
const saveNow = () => { if (!auth.user || !volume.value || !loaded) return; saveState.value = 'saving'; try { creator.saveDraft({ novelId, volumeId: volume.value.id, chapterId, title: title.value, content: content.value, plainText: plainText.value, authorNote: authorNote.value, savedAt: new Date().toISOString() }); dirty.value = false; saveState.value = 'saved' } catch { saveState.value = 'error' } }
const autoSave = useDebounceFn(saveNow, 900)
function changed() { if (!loaded) return; dirty.value = true; saveState.value = 'saving'; autoSave() }
watch([title, authorNote], changed)
function updateContent(next: JSONContent, text: string) { content.value = next; plainText.value = text; changed() }
function beforeUnload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
onMounted(() => window.addEventListener('beforeunload', beforeUnload)); onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(() => !dirty.value || window.confirm('还有未保存的修改，确定离开吗？'))
function publish() { if (!auth.user || !volume.value) return; errors.value = {}; publishError.value = ''; const parsed = chapterDraftSchema.safeParse({ title: title.value, plainText: plainText.value }); if (!parsed.success) { errors.value = schemaErrors(parsed.error); return }saveNow(); if (!window.confirm('确认发布这一章吗？发布后公开读者将可以阅读。')) return; try { const source = creator.drafts.value.find(item => item.chapterId === chapterId); if (!source) throw new Error('草稿保存失败'); const draft = JSON.parse(JSON.stringify(source)); creator.publishChapter(novelId, volume.value.id, chapterId, auth.user.id, draft); dirty.value = false; navigateTo(`/creator/novels/${novelId}/chapters`) } catch { publishError.value = '发布失败，草稿已安全保留。请检查后重试。' } }
</script>

<template>
  <main class="chapter-edit-page">
    <div class="chapter-edit-shell">
      <aside class="chapter-tree">
        <NuxtLink :to="`/creator/novels/${novelId}/chapters`">← 卷章管理</NuxtLink><h2>{{ novel?.title }}</h2><template
          v-for="vol in novel?.volumes||[]"
          :key="vol.id"
        >
          <strong>{{ vol.title }}</strong><NuxtLink
            v-for="item in vol.chapters"
            :key="item.id"
            :to="`/creator/novels/${novelId}/chapters/${item.id}/edit`"
            :class="{ active: item.id===chapterId }"
          >{{ item.title }}</NuxtLink>
        </template>
      </aside><section class="chapter-workspace">
        <div
          v-if="recovered"
          class="draft-recovered"
        >
          <UIcon name="i-lucide-history" />已恢复上次自动保存的草稿。
        </div><UInput
          v-model="title"
          size="xl"
          placeholder="章节标题"
          class="chapter-title-input"
        /><p
          v-if="errors.title"
          class="editor-error"
        >
          {{ errors.title }}
        </p><EditorChapterEditor
          :model-value="content"
          @update="updateContent"
        /><p
          v-if="errors.plainText"
          class="editor-error"
        >
          {{ errors.plainText }}
        </p><label class="author-note-field">作者的话<UTextarea
          v-model="authorNote"
          :rows="3"
          placeholder="可选，写在正文之后"
        /></label><footer class="editor-statusbar">
          <div><span :class="`is-${saveState}`">{{ saveState==='saving'?'正在自动保存…':saveState==='error'?'自动保存失败':'已自动保存' }}</span><span>· {{ plainText.length.toLocaleString('zh-CN') }} 字</span></div><div>
            <UButton
              label="保存草稿"
              color="neutral"
              variant="ghost"
              @click="saveNow"
            /><UButton
              label="预览"
              color="neutral"
              variant="outline"
              @click="previewOpen=true"
            /><UButton
              label="发布"
              icon="i-lucide-send"
              @click="publish"
            />
          </div>
        </footer><p
          v-if="publishError"
          class="publish-error"
        >
          {{ publishError }} <button
            type="button"
            @click="publish"
          >
            重试发布
          </button>
        </p>
      </section>
    </div><UModal
      v-model:open="previewOpen"
      title="章节预览"
      description="发布前检查标题、正文和作者的话。"
    >
      <template #body>
        <article class="chapter-preview">
          <h1>{{ title||'未命名章节' }}</h1><p
            v-for="(paragraph, index) in plainText.split(/\n+/).filter(Boolean)"
            :key="index"
          >
            {{ paragraph }}
          </p><aside v-if="authorNote">
            <strong>作者的话</strong><p>{{ authorNote }}</p>
          </aside>
        </article>
      </template>
    </UModal>
  </main>
</template>

<style scoped>
.chapter-edit-page{min-height:calc(100vh - var(--site-header-height));background:var(--site-paper)}.chapter-edit-shell{display:grid;grid-template-columns:15rem minmax(0,1fr);max-width:1200px;margin:auto}.chapter-tree{position:sticky;top:var(--site-header-height);height:calc(100vh - var(--site-header-height));overflow:auto;padding:1.5rem 1rem;border-right:1px solid var(--site-line);background:var(--site-surface)}.chapter-tree>a:first-child{color:var(--site-muted);font-size:.72rem}.chapter-tree h2{margin:1rem 0;font-weight:600}.chapter-tree strong{display:block;margin:1rem 0 .4rem;font-size:.75rem}.chapter-tree a:not(:first-child){display:block;padding:.45rem .6rem;border-radius:.4rem;color:var(--site-muted);font-size:.72rem}.chapter-tree a.active{background:var(--color-brand-100);color:var(--color-brand-800)}.chapter-workspace{min-width:0;padding:2rem}.chapter-title-input{width:100%;margin-bottom:1rem}.draft-recovered{margin-bottom:1rem;padding:.7rem;border:1px solid var(--color-brand-200);border-radius:.5rem;background:var(--color-brand-50);font-size:.75rem}.author-note-field{display:grid;gap:.5rem;margin-top:1rem;font-size:.8rem}.editor-statusbar{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;padding:.7rem;border:1px solid var(--site-line);border-radius:.6rem;background:color-mix(in srgb,var(--site-surface) 94%,transparent);backdrop-filter:blur(12px)}.editor-statusbar>div{display:flex;align-items:center;gap:.5rem;color:var(--site-muted);font-size:.7rem}.editor-statusbar .is-error,.editor-error,.publish-error{color:#b84b4b}.publish-error{margin-top:.7rem;font-size:.75rem}.publish-error button{text-decoration:underline}.chapter-preview{font-family:var(--font-reading);line-height:1.9}.chapter-preview h1{margin-bottom:1.5rem;text-align:center;font-size:1.6rem;font-weight:600}.chapter-preview p{margin:.8rem 0}.chapter-preview aside{margin-top:2rem;padding:1rem;border-left:2px solid var(--color-brand-300)}@media(max-width:800px){.chapter-edit-shell{grid-template-columns:1fr}.chapter-tree{position:static;width:100%;height:auto;border-right:0;border-bottom:1px solid var(--site-line)}.chapter-tree a:not(:first-child){display:inline-block}.chapter-workspace{padding:1rem}.editor-statusbar{align-items:flex-start;flex-direction:column}.editor-statusbar>div:last-child{width:100%;flex-wrap:wrap}}
</style>

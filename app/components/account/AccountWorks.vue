<script setup lang="ts">
const auth = useAuthStore()
const creator = useCreatorStore()
const novels = creator.ownedNovels(auth.user?.id ?? '')
const words = (novel: typeof novels.value[number]) => novel.volumes.flatMap(volume => volume.chapters).reduce((sum, chapter) => sum + chapter.plainText.length, 0)
</script>

<template>
  <header><h1>我的作品</h1><span>管理小说资料、卷章和草稿。</span></header>
  <div class="section-actions">
    <UButton
      to="/creator/novels/new"
      label="创建作品"
      icon="i-lucide-plus"
    /><UButton
      to="/creator/drafts"
      label="草稿箱"
      color="neutral"
      variant="outline"
    />
  </div>
  <div
    v-if="novels.length"
    class="work-list"
  >
    <article
      v-for="novel in novels"
      :key="novel.id"
    >
      <div class="work-cover">
        <NuxtImg
          v-if="novel.coverDataUrl"
          :src="novel.coverDataUrl"
          :alt="`${novel.title}封面`"
          width="112"
          height="149"
        /><UIcon
          v-else
          name="i-lucide-book-open"
        />
      </div>
      <div class="work-info">
        <strong>{{ novel.title }}</strong><span>{{ novel.status === 'draft' ? '草稿' : novel.status === 'serializing' ? '连载中' : '已完结' }} · {{ words(novel).toLocaleString('zh-CN') }} 字 · {{ novel.volumes.length }} 卷</span>
      </div>
      <div class="work-actions">
        <UButton
          :to="`/creator/novels/${novel.id}/chapters`"
          label="管理卷章"
          size="sm"
          variant="outline"
        /><UButton
          :to="`/creator/novels/${novel.id}/edit`"
          label="编辑资料"
          size="sm"
          color="neutral"
          variant="ghost"
        />
      </div>
    </article>
  </div>
  <EmptyState
    v-else
    icon="i-lucide-book-plus"
    title="还没有作品"
    description="从一个名字开始，写下你的第一部小说。"
  />
</template>

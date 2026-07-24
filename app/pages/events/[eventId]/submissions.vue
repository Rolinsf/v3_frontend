<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
const route = useRoute(); const admin = useAdmin(); const activity = computed(() => admin.data.value.activities.find(item => item.id === route.params.eventId)); const submissions = computed(() => admin.data.value.activitySubmissions.filter(item => item.activityId === route.params.eventId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)))
</script>

<template>
  <main class="site-container submissions">
    <header><NuxtLink to="/events">← 返回活动中心</NuxtLink><h1>{{ activity?.title }} · 投稿</h1><p>共 {{ submissions.length }} 篇展示投稿</p></header><div
      v-if="submissions.length"
      class="submission-grid"
    >
      <article
        v-for="item in submissions"
        :key="item.id"
      >
        <div><span>投稿作品</span><time>{{ item.submittedAt.slice(0, 10) }}</time></div><h2>{{ item.title }}</h2><strong>{{ item.authorName }}</strong><p>{{ item.synopsis }}</p><footer>
          <span><UIcon name="i-lucide-eye" />{{ item.viewCount }}</span><span><UIcon name="i-lucide-heart" />{{ item.likeCount }}</span><span><UIcon name="i-lucide-message-circle" />{{ item.commentCount }}</span><UButton
            label="阅读投稿"
            size="sm"
            variant="outline"
          />
        </footer>
      </article>
    </div><EmptyState
      v-else
      icon="i-lucide-files"
      title="还没有展示投稿"
      description="成为第一个参加本次活动的作者吧。"
    /><CommentSection
      v-if="activity"
      id="comments"
      target-type="novel"
      :target-id="`activity-${activity.id}`"
      title="活动评论"
    />
  </main>
</template>

<style scoped>
.submissions{padding:2.5rem 0 5rem}.submissions header>a{color:var(--site-muted);font-size:.75rem}.submissions h1{margin:.8rem 0 .3rem;font-size:1.7rem;font-weight:600}.submissions header>p{color:var(--site-muted)}.submission-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:1.5rem}.submission-grid article{padding:1.25rem;border:1px solid var(--site-line);border-radius:.8rem;background:var(--site-surface)}article>div{display:flex;justify-content:space-between;color:var(--site-muted);font-size:.7rem}article h2{margin:.7rem 0 .25rem;font-size:1.1rem;font-weight:600}article>strong{color:var(--color-brand-700);font-size:.75rem}article>p{margin:.7rem 0;color:var(--site-muted);line-height:1.7}article footer{display:flex;align-items:center;gap:.8rem}article footer span{display:inline-flex;align-items:center;gap:.2rem;color:var(--site-muted);font-size:.7rem}article footer a,article footer button{margin-left:auto}@media(max-width:700px){.submission-grid{grid-template-columns:1fr}}
</style>

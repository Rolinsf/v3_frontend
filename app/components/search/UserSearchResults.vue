<script setup lang="ts">
import type { PublicUserProfile } from '~/types/user'

const props = defineProps<{ users: PublicUserProfile[], query: string }>()
function segments(value: string) {
  const query = props.query.trim()
  if (!query) return [{ text: value, match: false }]
  const index = value.toLocaleLowerCase().indexOf(query.toLocaleLowerCase())
  if (index < 0) return [{ text: value, match: false }]
  return [
    { text: value.slice(0, index), match: false },
    { text: value.slice(index, index + query.length), match: true },
    { text: value.slice(index + query.length), match: false }
  ].filter(item => item.text)
}
</script>

<template>
  <div
    v-if="users.length"
    class="user-results"
  >
    <NuxtLink
      v-for="user in users"
      :key="user.id"
      :to="`/users/${user.id}`"
    >
      <span class="user-avatar">{{ user.name.slice(0, 1) }}</span>
      <div><strong><template
        v-for="(part, index) in segments(user.name)"
        :key="index"
      ><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></strong><p>{{ user.bio }}</p><small>{{ user.role === 'author' ? '作者' : '读者' }} · 加入于 {{ new Date(user.joinedAt).getFullYear() }}</small></div>
    </NuxtLink>
  </div>
  <EmptyState
    v-else
    icon="i-lucide-user-search"
    title="没有找到相关用户"
    description="试试昵称、作者名或简介中的其他关键词。"
  />
</template>

<style scoped>
.user-results{display:grid;gap:.7rem}.user-results>a{display:grid;grid-template-columns:3rem 1fr;gap:.8rem;padding:1rem;border:1px solid var(--site-line);border-radius:.7rem}.user-avatar{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--color-brand-100);color:var(--color-brand-800)}.user-results p,.user-results small{color:var(--site-muted);font-size:.75rem}.user-results mark{background:var(--color-brand-100);color:inherit}
</style>

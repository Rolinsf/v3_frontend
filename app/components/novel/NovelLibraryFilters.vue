<script setup lang="ts">
import type { AdminTag } from '~/types/admin'
import type { Category } from '~/types/novel'
import type { NovelSort } from '~/composables/useNovels'

const props = defineProps<{
  categories: Category[]
  tags: AdminTag[]
  category: string
  subcategory: string
  status: '' | 'serializing' | 'completed'
  tag: string
  sort: NovelSort
  showSort?: boolean
}>()
const emit = defineEmits<{
  'update:category': [value: string]
  'update:subcategory': [value: string]
  'update:status': [value: '' | 'serializing' | 'completed']
  'update:tag': [value: string]
  'update:sort': [value: NovelSort]
}>()
const current = computed(() => props.categories.find(item => item.slug === props.category))
const children = computed(() => current.value?.children.filter(item => item.enabled) ?? [])
const sortOptions: { value: NovelSort, label: string }[] = [
  { value: 'updated', label: '最近更新' },
  { value: 'wordCount', label: '字数最多' },
  { value: 'debut', label: '新作优先' },
  { value: 'latestChapter', label: '最新章节' }
]
function selectCategory(value: string) {
  emit('update:category', value)
  emit('update:subcategory', '')
}
</script>

<template>
  <div class="library-filters">
    <div class="filter-group">
      <h3>一级分类</h3>
      <button
        type="button"
        class="filter-item"
        :class="{ 'is-active': !category }"
        @click="selectCategory('')"
      >
        全部
      </button>
      <button
        v-for="item in categories"
        :key="item.id"
        type="button"
        class="filter-item"
        :class="{ 'is-active': category === item.slug }"
        @click="selectCategory(item.slug)"
      >
        <UIcon :name="item.icon || 'i-lucide-bookmark'" /><span>{{ item.name }}</span><em>{{ item.novelCount }}</em>
      </button>
    </div>
    <div
      v-if="children.length"
      class="filter-group"
    >
      <h3>{{ current?.name }} · 二级分类</h3>
      <button
        type="button"
        class="filter-item"
        :class="{ 'is-active': !subcategory }"
        @click="emit('update:subcategory', '')"
      >
        全部
      </button>
      <button
        v-for="item in children"
        :key="item.id"
        type="button"
        class="filter-item"
        :class="{ 'is-active': subcategory === item.slug }"
        @click="emit('update:subcategory', item.slug)"
      >
        <span>{{ item.name }}</span><em>{{ item.novelCount }}</em>
      </button>
    </div>
    <div class="filter-group">
      <h3>完结状态</h3>
      <button
        v-for="item in [{ value: '', label: '全部' }, { value: 'serializing', label: '连载中' }, { value: 'completed', label: '已完结' }]"
        :key="item.value"
        type="button"
        class="filter-item"
        :class="{ 'is-active': status === item.value }"
        @click="emit('update:status', item.value as typeof status)"
      >
        {{ item.label }}
      </button>
    </div>
    <div
      v-if="tags.length"
      class="filter-group"
    >
      <h3>标签</h3>
      <button
        type="button"
        class="filter-item"
        :class="{ 'is-active': !tag }"
        @click="emit('update:tag', '')"
      >
        全部
      </button>
      <button
        v-for="item in tags"
        :key="item.id"
        type="button"
        class="filter-item"
        :class="{ 'is-active': tag === item.id }"
        @click="emit('update:tag', item.id)"
      >
        {{ item.name }}
      </button>
    </div>
    <div
      v-if="showSort"
      class="filter-group"
    >
      <h3>排序方式</h3>
      <button
        v-for="item in sortOptions"
        :key="item.value"
        type="button"
        class="filter-item"
        :class="{ 'is-active': sort === item.value }"
        @click="emit('update:sort', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.library-filters{display:grid;gap:.85rem}.filter-group{display:flex;flex-wrap:nowrap;align-items:center;gap:.35rem;overflow-x:auto;scrollbar-width:thin}.filter-group h3{flex:0 0 5.5rem;margin:0;color:var(--site-muted);font-size:.75rem;font-weight:600;white-space:nowrap}.filter-item{display:flex;flex:0 0 auto;align-items:center;gap:.5rem;padding:.5rem .65rem;border-radius:.5rem;color:var(--site-ink);font-size:.85rem;white-space:nowrap}.filter-item:hover{background:var(--color-brand-50)}.filter-item.is-active{background:var(--color-brand-100);color:var(--color-brand-800);font-weight:600}.filter-item em{color:var(--site-muted);font-size:.7rem;font-style:normal}@media(max-width:639px){.filter-item{min-height:2.75rem}}
</style>

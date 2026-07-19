<script setup lang="ts">
const primary = defineModel<string>('primary', { required: true })
const secondary = defineModel<string>('secondary', { required: true })
const { data: categories, pending, error } = useCategoryTree()
const activeChildren = computed(() => categories.value?.find(item => item.id === primary.value)?.children.filter(item => item.enabled) ?? [])
watch(primary, () => {
  if (!activeChildren.value.some(item => item.id === secondary.value)) secondary.value = ''
})
</script>

<template>
  <div class="category-selector">
    <p v-if="pending">
      正在加载分类…
    </p><p
      v-else-if="error"
      class="category-selector__error"
    >
      分类加载失败，暂时无法提交。
    </p>
    <template v-else>
      <label>一级分类<select v-model="primary"><option value="">请选择</option><option
        v-for="item in categories"
        :key="item.id"
        :value="item.id"
        :disabled="!item.enabled"
      >{{ item.name }}</option></select></label>
      <label>二级分类<select
        v-model="secondary"
        :disabled="!primary"
      ><option value="">请选择</option><option
        v-for="item in activeChildren"
        :key="item.id"
        :value="item.id"
      >{{ item.name }}</option></select></label>
    </template>
  </div>
</template>

<style scoped>
.category-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }.category-selector label { display: grid; gap: .4rem; color: var(--site-ink); font-size: .8rem; }.category-selector select { height: 2.5rem; padding: 0 .7rem; border: 1px solid var(--site-line); border-radius: .5rem; background: var(--site-surface); }.category-selector__error { grid-column: 1/-1; color: #b84b4b; font-size: .75rem; }@media(max-width:600px){.category-selector{grid-template-columns:1fr}}
</style>

<script setup lang="ts">
import logoUrl from '~/assets/img/logo.jpg'

withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
}>(), {
  size: 'small'
})
</script>

<template>
  <span
    class="brand-logo"
    :class="`brand-logo--${size}`"
    aria-label="若林轻小说"
  >
    <img
      :src="logoUrl"
      class="brand-logo__image"
      alt=""
      aria-hidden="true"
    >
  </span>
</template>

<script setup lang="ts">
const admin = useAdmin()
const footer = computed(() => admin.data.value.footer)
const visibleLinks = computed(() => [...footer.value.links]
  .filter(link => link.enabled)
  .sort((a, b) => a.order - b.order))
</script>

<template>
  <footer class="site-footer">
    <div class="site-container site-footer__inner">
      <p class="site-footer__copyright">
        {{ footer.copyright }}
      </p>
      <div class="site-footer__meta">
        <nav
          class="site-footer__links"
          aria-label="页脚导航"
        >
          <NuxtLink
            v-for="link in visibleLinks"
            :key="link.id"
            :to="link.url"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <p
          v-if="footer.secondaryText"
          class="site-footer__secondary"
        >
          {{ footer.secondaryText }}
        </p>
      </div>
    </div>
  </footer>
</template>

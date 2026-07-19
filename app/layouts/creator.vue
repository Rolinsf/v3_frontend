<script setup lang="ts">
// 创作中心布局：沿用主站视觉，提高信息密度，不套管理后台皮肤。
// 阶段 1 只建立骨架，作品/卷章/编辑器等具体页面在阶段 6 实现。
</script>

<template>
  <div class="site-shell creator-font-scope">
    <NavigationSiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <NavigationSiteFooter />
    <NavigationMobileTabBar />
  </div>
</template>

<style src="~/assets/css/wenkai.css"></style>

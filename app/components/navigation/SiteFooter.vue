<template>
  <footer class="site-footer">
    <div class="site-container site-footer__inner">
      <div>
        <AppLogo /><p class="site-footer__description">
          让每一页故事，都有一片安静生长的林地。
        </p>
      </div>
      <nav
        class="site-footer__links"
        aria-label="页脚导航"
      >
        <NuxtLink to="/about">关于若林</NuxtLink><NuxtLink to="/help">帮助中心</NuxtLink><NuxtLink to="/terms">用户协议</NuxtLink><NuxtLink to="/privacy">隐私政策</NuxtLink>
      </nav>
      <p class="site-footer__copyright">
        © {{ new Date().getFullYear() }} 若林轻小说
      </p>
    </div>
  </footer>
</template>

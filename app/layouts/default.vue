<template>
  <div class="site-shell">
    <NavigationSiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <NavigationSiteFooter />
    <NavigationMobileTabBar />
  </div>
</template>

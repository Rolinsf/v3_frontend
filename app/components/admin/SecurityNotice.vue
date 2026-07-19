<template>
  <aside class="admin-security">
    <UIcon name="i-lucide-shield-alert" /><p><strong>前端仅负责操作体验</strong><span>管理员权限、分类层级与引用完整性、审核和封禁操作必须由后端再次校验并记录审计日志。</span></p>
  </aside>
</template>

<style scoped>
.admin-security{display:flex;gap:.7rem;margin:1rem 0 1.5rem;padding:.8rem 1rem;border:1px solid color-mix(in srgb,var(--site-warm) 35%,var(--site-line));border-radius:.65rem;background:color-mix(in srgb,var(--site-warm) 7%,var(--site-surface))}.admin-security>svg{flex:none;color:var(--site-warm)}.admin-security p{display:grid;gap:.15rem;font-size:.75rem}.admin-security span{color:var(--site-muted)}
</style>

<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
definePageMeta({ layout: 'admin', middleware: ['admin'] }); useSeoMeta({ title: '用户封禁｜若林轻小说' }); const admin = useAdmin(); const reasons = reactive<Record<string, string>>({}); function toggle(id: string, banned: boolean) { if (banned) { admin.setBan(id, false); return } if (!window.confirm('确认封禁该用户吗？后端应撤销其有效会话并记录审计日志。')) return; admin.setBan(id, true, reasons[id]) }
</script>

<template>
  <section class="admin-page">
    <header><p>USER SAFETY</p><h1>用户封禁</h1><span>只提供最小封禁与解封能力。</span></header><AdminSecurityNotice /><div class="user-list">
      <article
        v-for="user in admin.data.value.users"
        :key="user.id"
      >
        <div>
          <strong>{{ user.name }}</strong><span>{{ user.role==='author'?'作者':'读者' }} · 加入于 {{ new Date(user.joinedAt).toLocaleDateString('zh-CN') }}</span><p v-if="user.banned">
            封禁原因：{{ user.banReason }}
          </p>
        </div><div>
          <UInput
            v-if="!user.banned"
            v-model="reasons[user.id]"
            placeholder="封禁原因"
            size="sm"
          /><UButton
            :label="user.banned?'解除封禁':'封禁用户'"
            :color="user.banned?'neutral':'error'"
            :variant="user.banned?'outline':'solid'"
            size="sm"
            @click="toggle(user.id, user.banned)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page>header p{color:var(--color-brand-700);font-size:.65rem;letter-spacing:.15em}.admin-page h1{margin:.3rem 0;font-size:1.8rem;font-weight:600}.admin-page>header span{color:var(--site-muted);font-size:.75rem}.user-list{display:grid}.user-list article{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--site-line)}.user-list article>div:first-child{display:grid;gap:.2rem}.user-list span,.user-list p{color:var(--site-muted);font-size:.7rem}.user-list article>div:last-child{display:flex;gap:.5rem}
</style>

<script setup lang="ts">
const account = useAccountStore()
const draft = reactive(structuredClone(account.preferences))
const currentPassword = ref('')
const nextPassword = ref('')
const message = ref('')

function save() {
  account.update(draft)
  message.value = '设置已保存'
}
function changePassword() {
  try {
    account.changePassword(currentPassword.value, nextPassword.value)
    currentPassword.value = ''
    nextPassword.value = ''
    message.value = '密码修改已在当前前端会话中模拟完成'
  } catch (cause) {
    message.value = cause instanceof Error ? cause.message : '修改失败'
  }
}
</script>

<template>
  <header><h1>偏好与隐私</h1><span>管理阅读同步、通知和公开范围。</span></header>
  <form
    class="settings-form"
    @submit.prevent="save"
  >
    <fieldset>
      <legend>阅读偏好</legend><UCheckbox
        v-model="draft.reading.syncProgress"
        label="登录后同步阅读进度"
      /><UCheckbox
        v-model="draft.reading.autoMarkRead"
        label="阅读接近结尾时自动标记已读"
      />
    </fieldset>
    <fieldset>
      <legend>通知偏好</legend><UCheckbox
        v-model="draft.notifications.replies"
        label="回复"
      /><UCheckbox
        v-model="draft.notifications.mentions"
        label="提及"
      /><UCheckbox
        v-model="draft.notifications.likes"
        label="点赞"
      /><UCheckbox
        v-model="draft.notifications.novelUpdates"
        label="作品更新"
      /><UCheckbox
        v-model="draft.notifications.reviews"
        label="审核结果"
      />
    </fieldset>
    <fieldset>
      <legend>隐私设置</legend><UCheckbox
        v-model="draft.privacy.showFollowing"
        label="公开关注列表"
      /><UCheckbox
        v-model="draft.privacy.showBookshelf"
        label="公开书架"
      /><UCheckbox
        v-model="draft.privacy.showContributions"
        label="公开创作贡献"
      />
    </fieldset>
    <UButton
      type="submit"
      label="保存设置"
    />
  </form>
  <section class="settings-security">
    <h2>修改密码</h2><UInput
      v-model="currentPassword"
      type="password"
      placeholder="当前密码"
    /><UInput
      v-model="nextPassword"
      type="password"
      placeholder="新密码（至少 8 位）"
    /><UButton
      label="修改密码"
      color="neutral"
      variant="outline"
      @click="changePassword"
    />
  </section>
  <section class="settings-devices">
    <h2>登录设备</h2><article
      v-for="device in account.devices"
      :key="device.id"
    >
      <div><strong>{{ device.name }}</strong><small>{{ device.current ? '当前设备' : device.lastActiveAt }}</small></div><UButton
        v-if="!device.current"
        label="移除"
        color="error"
        variant="ghost"
        @click="account.removeDevice(device.id)"
      />
    </article>
  </section>
  <p
    v-if="message"
    class="settings-message"
  >
    {{ message }}
  </p>
</template>

<style scoped>
.settings-form,.settings-form fieldset,.settings-security,.settings-devices{display:grid;gap:.8rem}.settings-form{margin-top:1.25rem}.settings-form fieldset,.settings-security,.settings-devices{padding:1rem;border:1px solid var(--site-line);border-radius:.7rem}.settings-form legend,.settings-security h2,.settings-devices h2{font-weight:600}.settings-security,.settings-devices{margin-top:1rem}.settings-devices article{display:flex;justify-content:space-between}.settings-devices small{display:block;color:var(--site-muted)}.settings-message{margin-top:1rem;color:var(--color-brand-700)}
</style>

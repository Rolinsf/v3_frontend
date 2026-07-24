<script setup lang="ts">
interface AuthFormState {
  identifier: string
  password: string
  agree: boolean
  name?: string
  confirmPassword?: string
}
const props = defineProps<{ mode: 'login' | 'register', state: AuthFormState, errors: Record<string, string>, pending: boolean, update: (key: keyof AuthFormState, value: string | boolean) => void }>()
const emit = defineEmits<{ submit: [] }>()
const fields = computed(() => props.mode === 'login'
  ? [{ key: 'identifier', label: '邮箱或手机号', type: 'text', autocomplete: 'username', placeholder: 'name@example.com 或 138…' }, { key: 'password', label: '密码', type: 'password', autocomplete: 'current-password', placeholder: '至少 8 位，含字母与数字' }]
  : [{ key: 'identifier', label: '邮箱或手机号', type: 'text', autocomplete: 'username', placeholder: 'name@example.com 或 138…' }, { key: 'name', label: '昵称', type: 'text', autocomplete: 'nickname', placeholder: '2-20 个字符' }, { key: 'password', label: '密码', type: 'password', autocomplete: 'new-password', placeholder: '至少 8 位，含字母与数字' }, { key: 'confirmPassword', label: '确认密码', type: 'password', autocomplete: 'new-password', placeholder: '再输入一次密码' }])
</script>

<template>
  <form
    class="auth-form"
    novalidate
    @submit.prevent="emit('submit')"
  >
    <div
      v-for="field in fields"
      :key="field.key"
      class="auth-field"
      :data-field="field.key"
    >
      <label :for="`${mode}-${field.key}`">{{ field.label }}</label>
      <UInput
        :id="`${mode}-${field.key}`"
        :model-value="String(state[field.key as keyof AuthFormState] ?? '')"
        :name="field.key"
        :type="field.type"
        :autocomplete="field.autocomplete"
        :placeholder="field.placeholder"
        :color="errors[field.key] ? 'error' : 'neutral'"
        class="auth-field__input"
        @update:model-value="props.update(field.key as keyof AuthFormState, String($event))"
      />
      <p
        v-if="errors[field.key]"
        class="auth-field__error"
      >
        {{ errors[field.key] }}
      </p>
    </div>
    <label class="auth-agree"><UCheckbox
      :model-value="state.agree"
      name="agree"
      @update:model-value="props.update('agree', Boolean($event))"
    /><span>我已阅读并同意 <NuxtLink
      to="/terms"
      class="auth-link"
    >用户协议</NuxtLink> 与 <NuxtLink
      to="/privacy"
      class="auth-link"
    >隐私政策</NuxtLink></span></label>
    <p
      v-if="errors.agree"
      class="auth-field__error"
    >
      {{ errors.agree }}
    </p>
    <UButton
      type="submit"
      block
      :loading="pending"
      :label="mode === 'login' ? '登录' : '注册并登录'"
      class="auth-submit"
    />
  </form>
</template>

<style scoped>
.auth-form{display:grid;gap:1.1rem}.auth-field{display:grid;gap:.4rem}.auth-field label{font-size:.78rem;font-weight:500}.auth-field__error{color:#b84b4b;font-size:.72rem}.auth-agree{display:flex;align-items:flex-start;gap:.5rem;color:var(--site-muted);font-size:.72rem;line-height:1.6}.auth-link{color:var(--color-brand-700)}
</style>

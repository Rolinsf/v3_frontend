<script setup lang="ts">
import { loginSchema, registerSchema, zodErrors } from '~/schemas/auth'
import type { AuthMode } from '~/types/auth'

definePageMeta({
  // 已登录用户访问 /login 时直接跳回
  middleware: ['guest']
})

useSeoMeta({
  title: '登录｜若林轻小说',
  description: '登录若林轻小说，同步书架、阅读进度与评论。'
})

const route = useRoute()
const auth = useAuthStore()

// 初始模式：URL ?mode=register 进入注册，否则登录。
const initialMode = route.query.mode === 'register' ? 'register' : 'login'
const mode = ref<AuthMode>(initialMode)

// 切换模式时同步 URL（replace 避免历史堆栈）
watch(mode, (value) => {
  const query: Record<string, string> = {}
  // 仅在来源页非空时保留 redirect，避免切换模式丢失回跳目标
  const redirect = route.query.redirect
  if (typeof redirect === 'string') query.redirect = redirect
  if (value === 'register') query.mode = 'register'
  navigateTo({ path: '/login', query }, { replace: true })
})

// ----- 表单状态 -----

const loginState = reactive({
  identifier: '',
  password: '',
  agree: false
})

const registerState = reactive({
  identifier: '',
  name: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 字段级错误：以 Zod Schema 校验失败时填充，提交成功后清空。
const fieldErrors = ref<Record<string, string>>({})
// 表单级错误：用于网络失败等无法归因到字段的情况。
const formError = ref<string>('')

const redirectTarget = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/'
})

async function handleLogin() {
  formError.value = ''
  fieldErrors.value = {}
  const result = loginSchema.safeParse(loginState)
  if (!result.success) {
    fieldErrors.value = zodErrors(result.error)
    await nextTick()
    focusFirstError()
    return
  }
  try {
    await auth.login(result.data.identifier)
    await afterAuthSuccess()
  } catch (error) {
    formError.value = extractMessage(error) ?? '登录失败，请稍后再试。'
  }
}

async function handleRegister() {
  formError.value = ''
  fieldErrors.value = {}
  const result = registerSchema.safeParse(registerState)
  if (!result.success) {
    fieldErrors.value = zodErrors(result.error)
    await nextTick()
    focusFirstError()
    return
  }
  try {
    await auth.register(result.data.identifier, result.data.name)
    await afterAuthSuccess()
  } catch (error) {
    formError.value = extractMessage(error) ?? '注册失败，请稍后再试。'
  }
}

async function afterAuthSuccess() {
  // 优先恢复 store 中保存的意图（包含 action/targetId 等信息）
  const intent = auth.consumeIntent()
  if (intent) auth.resumeIntent(intent)
  const target = intent?.redirect || redirectTarget.value
  await navigateTo(target)
}

function focusFirstError() {
  const firstErrorKey = Object.keys(fieldErrors.value)[0]
  if (!firstErrorKey) return
  const el = document.querySelector<HTMLElement>(`[data-field="${firstErrorKey}"]`)
    ?? document.querySelector<HTMLElement>(`input[name="${firstErrorKey}"]`)
  el?.focus()
}

function extractMessage(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return undefined
}

function switchMode(value: AuthMode) {
  fieldErrors.value = {}
  formError.value = ''
  mode.value = value
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card__brand">
        <AppLogo />
      </div>

      <h1 class="auth-card__title">
        {{ mode === 'login' ? '欢迎回来' : '加入若林' }}
      </h1>
      <p class="auth-card__subtitle">
        {{ mode === 'login'
          ? '登录后可以同步书架、阅读进度和评论。'
          : '注册一个账号，开始记录你的阅读与创作。' }}
      </p>

      <div
        class="auth-tabs"
        role="tablist"
        aria-label="认证模式"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'login'"
          class="auth-tab"
          :class="{ 'is-active': mode === 'login' }"
          @click="switchMode('login')"
        >
          登录
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'register'"
          class="auth-tab"
          :class="{ 'is-active': mode === 'register' }"
          @click="switchMode('register')"
        >
          注册
        </button>
      </div>

      <!-- 表单级错误：网络失败等无法归因到字段的情况 -->
      <p
        v-if="formError"
        class="auth-form-error"
        role="alert"
      >
        <UIcon name="i-lucide-alert-circle" />
        {{ formError }}
      </p>

      <!-- 登录表单 -->
      <form
        v-if="mode === 'login'"
        class="auth-form"
        novalidate
        @submit.prevent="handleLogin"
      >
        <div
          class="auth-field"
          data-field="identifier"
        >
          <label for="login-identifier">邮箱或手机号</label>
          <UInput
            id="login-identifier"
            v-model="loginState.identifier"
            name="identifier"
            type="text"
            autocomplete="username"
            placeholder="name@example.com 或 138…"
            :color="fieldErrors.identifier ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.identifier"
            class="auth-field__error"
          >
            {{ fieldErrors.identifier }}
          </p>
        </div>

        <div
          class="auth-field"
          data-field="password"
        >
          <label for="login-password">密码</label>
          <UInput
            id="login-password"
            v-model="loginState.password"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="至少 8 位，含字母与数字"
            :color="fieldErrors.password ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.password"
            class="auth-field__error"
          >
            {{ fieldErrors.password }}
          </p>
        </div>

        <label class="auth-agree">
          <UCheckbox
            v-model="loginState.agree"
            name="agree"
          />
          <span>
            我已阅读并同意
            <NuxtLink
              to="/terms"
              class="auth-link"
            >用户协议</NuxtLink>
            与
            <NuxtLink
              to="/privacy"
              class="auth-link"
            >隐私政策</NuxtLink>
          </span>
        </label>
        <p
          v-if="fieldErrors.agree"
          class="auth-field__error"
        >
          {{ fieldErrors.agree }}
        </p>

        <UButton
          type="submit"
          block
          :loading="auth.pending"
          label="登录"
          class="auth-submit"
        />
      </form>

      <!-- 注册表单 -->
      <form
        v-else
        class="auth-form"
        novalidate
        @submit.prevent="handleRegister"
      >
        <div
          class="auth-field"
          data-field="identifier"
        >
          <label for="register-identifier">邮箱或手机号</label>
          <UInput
            id="register-identifier"
            v-model="registerState.identifier"
            name="identifier"
            type="text"
            autocomplete="username"
            placeholder="name@example.com 或 138…"
            :color="fieldErrors.identifier ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.identifier"
            class="auth-field__error"
          >
            {{ fieldErrors.identifier }}
          </p>
        </div>

        <div
          class="auth-field"
          data-field="name"
        >
          <label for="register-name">昵称</label>
          <UInput
            id="register-name"
            v-model="registerState.name"
            name="name"
            type="text"
            autocomplete="nickname"
            placeholder="2-20 个字符"
            :color="fieldErrors.name ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.name"
            class="auth-field__error"
          >
            {{ fieldErrors.name }}
          </p>
        </div>

        <div
          class="auth-field"
          data-field="password"
        >
          <label for="register-password">密码</label>
          <UInput
            id="register-password"
            v-model="registerState.password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="至少 8 位，含字母与数字"
            :color="fieldErrors.password ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.password"
            class="auth-field__error"
          >
            {{ fieldErrors.password }}
          </p>
        </div>

        <div
          class="auth-field"
          data-field="confirmPassword"
        >
          <label for="register-confirm">确认密码</label>
          <UInput
            id="register-confirm"
            v-model="registerState.confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="再输入一次密码"
            :color="fieldErrors.confirmPassword ? 'error' : 'neutral'"
            class="auth-field__input"
          />
          <p
            v-if="fieldErrors.confirmPassword"
            class="auth-field__error"
          >
            {{ fieldErrors.confirmPassword }}
          </p>
        </div>

        <label class="auth-agree">
          <UCheckbox
            v-model="registerState.agree"
            name="agree"
          />
          <span>
            我已阅读并同意
            <NuxtLink
              to="/terms"
              class="auth-link"
            >用户协议</NuxtLink>
            与
            <NuxtLink
              to="/privacy"
              class="auth-link"
            >隐私政策</NuxtLink>
          </span>
        </label>
        <p
          v-if="fieldErrors.agree"
          class="auth-field__error"
        >
          {{ fieldErrors.agree }}
        </p>

        <UButton
          type="submit"
          block
          :loading="auth.pending"
          label="注册并登录"
          class="auth-submit"
        />
      </form>

      <p class="auth-footnote">
        若林不会未经同意向第三方分享你的阅读记录。
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: calc(100vh - var(--site-header-height)); display: grid; place-items: center; padding: 3rem 1rem 5rem; }
.auth-card { width: min(100%, 400px); padding: 2rem 1.75rem 1.75rem; border: 1px solid var(--site-line); border-radius: 1rem; background: var(--site-surface); box-shadow: 0 1px 0 color-mix(in srgb, var(--site-line) 60%, transparent); }
.auth-card__brand { display: flex; justify-content: center; margin-bottom: 1rem; }
.auth-card__title { margin: 0; text-align: center; font-family: var(--font-reading); font-size: 1.5rem; font-weight: 600; color: var(--site-ink); }
.auth-card__subtitle { margin: .5rem 0 1.5rem; text-align: center; color: var(--site-muted); font-size: .85rem; line-height: 1.7; }

.auth-tabs { display: inline-flex; width: 100%; margin-bottom: 1.25rem; padding: .2rem; border: 1px solid var(--site-line); border-radius: 999px; background: color-mix(in srgb, var(--site-paper) 80%, transparent); }
.auth-tab { flex: 1; padding: .5rem 1rem; border: 0; border-radius: 999px; background: transparent; color: var(--site-muted); font-size: .85rem; cursor: pointer; transition: color 180ms ease, background-color 180ms ease; }
.auth-tab.is-active { background: var(--color-brand-600); color: white; }

.auth-form-error { display: flex; align-items: center; gap: .4rem; margin: 0 0 1rem; padding: .65rem .8rem; border: 1px solid color-mix(in srgb, var(--site-warm) 50%, transparent); border-radius: .5rem; background: color-mix(in srgb, var(--site-warm) 8%, transparent); color: var(--site-warm); font-size: .8rem; }
.auth-form-error .icon { flex: none; width: 1rem; height: 1rem; }

.auth-form { display: grid; gap: 1rem; }
.auth-field { display: grid; gap: .4rem; }
.auth-field label { color: var(--site-ink); font-size: .82rem; }
.auth-field__input { width: 100%; }
.auth-field__error { margin: 0; color: var(--site-warm); font-size: .75rem; line-height: 1.5; }

.auth-agree { display: flex; align-items: flex-start; gap: .55rem; margin-top: .25rem; color: var(--site-muted); font-size: .78rem; line-height: 1.7; }
.auth-agree :deep(span) { flex: 1; }
.auth-link { color: var(--color-brand-700); text-decoration: underline; text-underline-offset: .15em; }
.auth-link:hover { color: var(--color-brand-600); }

.auth-submit { margin-top: .5rem; }

.auth-footnote { margin: 1.25rem 0 0; text-align: center; color: var(--site-muted); font-size: .72rem; line-height: 1.7; }

@media (max-width: 479px) {
  .auth-card { padding: 1.5rem 1.25rem; }
  .auth-card__title { font-size: 1.35rem; }
}
</style>

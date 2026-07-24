// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', '~/assets/css/reader.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: '若林轻小说',
    defaultLocale: 'zh-CN'
  },

  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET,
    public: {
      siteUrl: 'http://localhost:3000',
      apiBase: '/api'
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/bookshelf': { redirect: '/account?section=reading' },
    '/history': { redirect: '/account?section=reading&view=history' },
    '/notifications': { redirect: '/account?section=notifications' },
    '/account/comments': { redirect: '/account?section=comments' },
    '/creator': { redirect: '/account?section=works' }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    provider: 'local'
  }
})

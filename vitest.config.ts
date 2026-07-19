import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    hookTimeout: 120000,
    include: ['tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)', 'tests/nuxt/**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
})

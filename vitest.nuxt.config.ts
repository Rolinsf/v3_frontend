import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/nuxt/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    testTimeout: 30000,
    hookTimeout: 30000
  }
})

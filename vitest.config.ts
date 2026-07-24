import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => tag === 'NuxtLink' || tag === 'UIcon'
      }
    }
  })],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: [
      'tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'tests/components/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
    exclude: ['tests/e2e/**', 'tests/nuxt/**'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000
  }
})

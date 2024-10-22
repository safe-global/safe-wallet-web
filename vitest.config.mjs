// vitest.config.mjs
import reactNative from 'vitest-react-native'
// this is needed for react jsx support
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  plugins: [reactNative(), react()],
  test: {
    reporters: ['default', 'html'],
    coverage: {
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/tests/*'],
      enabled: true,
      reporter: ['json', 'html'],
    },
    exclude: ['./node_modules', './e2e'],
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@/src': path.resolve(__dirname, 'src'),
    },
  },
})

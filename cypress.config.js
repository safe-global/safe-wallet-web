import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'exhdra',
  trashAssetsBeforeRuns: true,

  retries: {
    runMode: 3,
    openMode: 0,
  },

  e2e: {
    baseUrl: 'http://localhost:3000',
    testIsolation: false,
    hideXHR: true,
    defaultCommandTimeout: 10000,
  },

  chromeWebSecurity: false,
})

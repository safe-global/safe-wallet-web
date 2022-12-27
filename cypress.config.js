import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'exhdra',
  trashAssetsBeforeRuns: true,

  env: {
    CYPRESS_MNEMONIC: process.env.CYPRESS_MNEMONIC,
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    baseUrl: 'http://localhost:3000',
  },

  chromeWebSecurity: false,
})

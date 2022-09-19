import { defineConfig } from 'cypress'

export default defineConfig({
  trashAssetsBeforeRuns: true,

  env: {
    CYPRESS_MNEMONIC: process.env.CYPRESS_MNEMONIC,
  },

  e2e: {
    baseUrl: 'https://web-core.pages.dev/',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})

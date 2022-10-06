import { defineConfig } from 'cypress'
import { config } from 'dotenv'

config()

export default defineConfig({
  projectId: 'exhdra',
  trashAssetsBeforeRuns: true,

  env: {
    CYPRESS_MNEMONIC: process.env.CYPRESS_MNEMONIC,
  },

  e2e: {
    baseUrl: 'http://localhost:3000',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})

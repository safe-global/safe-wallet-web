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
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})

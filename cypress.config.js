import { defineConfig } from 'cypress'
import * as fs from 'fs'

export default defineConfig({
  projectId: 'exhdra',
  trashAssetsBeforeRuns: true,

  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'))
          if (!failures) {
            fs.unlinkSync(results.video)
          }
        }
      })
    },
    baseUrl: 'http://localhost:3000',
    testIsolation: false,
    hideXHR: true,
    defaultCommandTimeout: 10000,
  },

  chromeWebSecurity: false,
})

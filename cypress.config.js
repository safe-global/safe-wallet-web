import { defineConfig } from 'cypress'
import 'dotenv/config'
import * as fs from 'fs'

import { configureVisualRegression } from 'cypress-visual-regression'

export default defineConfig({
  projectId: 'exhdra',
  trashAssetsBeforeRuns: true,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'reports/junit-[hash].xml',
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on, config) {
      configureVisualRegression(on),
        on('task', {
          log(message) {
            console.log(message)
            return null
          },
        })

      on('after:spec', (spec, results) => {
        if (results && results.video) {
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'))
          if (!failures) {
            fs.unlinkSync(results.video)
          }
        }
      })
    },
    env: {
      ...process.env,
      visualRegressionType: 'regression',
      visualRegressionBaseDirectory: 'cypress/snapshots/actual',
      visualRegressionDiffDirectory: 'cypress/snapshots/diff',
      visualRegressionGenerateDiff: 'fail',
    },
    baseUrl: 'http://localhost:3000',
    testIsolation: false,
    hideXHR: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
  },

  chromeWebSecurity: false,
})

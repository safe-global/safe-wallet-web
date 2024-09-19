import { defineConfig } from 'cypress'
import 'dotenv/config'
import * as fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { configureVisualRegression } from 'cypress-visual-regression'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
      // Read and parse the terms Markdown file
      try {
        const filePath = path.resolve(__dirname, './src/markdown/terms/terms.md')

        const content = fs.readFileSync(filePath, 'utf8')
        const parsed = matter(content)
        const frontmatter = parsed.data

        // Set Cookie term version on the cypress env - this way we can access it in the tests
        config.env.CURRENT_COOKIE_TERMS_VERSION = frontmatter.version
      } catch (error) {
        console.error('Error reading or parsing terms.md file:', error)
      }

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

      return config
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

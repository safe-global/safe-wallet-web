const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(svg)$': '<rootDir>/mocks/svg.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: { url: 'http://localhost/balances?safe=rin:0xb3b83bf204C458B461de9B0CD2739DB152b4fa5A' },
  globals: {
    fetch: global.fetch,
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// Jest does not allow modification of transformIgnorePatterns within createJestConfig, therefore we add one entry after initializing the config
module.exports = async () => {
  const jestConfig = await createJestConfig(customJestConfig)()
  const existingTransformIgnorePatterns = jestConfig.transformIgnorePatterns.filter(
    (pattern) => pattern !== '/node_modules/',
  )

  return {
    ...jestConfig,
    transformIgnorePatterns: [...existingTransformIgnorePatterns, '/node_modules/(?!(@web3-onboard/common)/)'],
  }
}

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
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

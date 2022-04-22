// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

const mockOnboardState = {
  chains: [],
  walletModules: [],
  wallets: [],
  accountCenter: {
    enabled: false,
    position: 'topRight',
    expanded: false,
  },
}

jest.mock('@web3-onboard/core', () => () => ({
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
  state: {
    select: () => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }),
    get: () => mockOnboardState,
  },
}))

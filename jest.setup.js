// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

jest.mock('@web3-onboard/coinbase', () => jest.fn())
jest.mock('@web3-onboard/fortmatic', () => jest.fn())
jest.mock('@web3-onboard/injected-wallets', () => jest.fn())
jest.mock('@web3-onboard/keepkey', () => jest.fn())
// jest.mock('@web3-onboard/keystone', () => jest.fn())
jest.mock('@web3-onboard/ledger', () => jest.fn())
jest.mock('@web3-onboard/portis', () => jest.fn())
jest.mock('@web3-onboard/torus', () => jest.fn())
jest.mock('@web3-onboard/trezor', () => jest.fn())
jest.mock('@web3-onboard/walletconnect', () => jest.fn())

const mockOnboardState = {
  chains: [],
  walletModules: [],
  wallets: [],
  accountCenter: {},
}

jest.mock('@web3-onboard/core', () => () => ({
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
  state: {
    select: (key) => ({
      subscribe: (next) => {
        next(mockOnboardState[key])

        return {
          unsubscribe: jest.fn(),
        }
      },
    }),
    get: () => mockOnboardState,
  },
}))

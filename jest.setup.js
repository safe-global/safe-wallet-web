// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import { TextEncoder, TextDecoder } from 'util'

jest.mock('@web3-onboard/coinbase', () => jest.fn())
jest.mock('@web3-onboard/injected-wallets', () => ({ ProviderLabel: { MetaMask: 'MetaMask' } }))
jest.mock('@web3-onboard/keystone/dist/index', () => jest.fn())
jest.mock('@web3-onboard/ledger/dist/index', () => jest.fn())
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

// to avoid failing tests in some environments
const NumberFormat = Intl.NumberFormat
const englishTestLocale = 'en'

// `viem` used by the `safe-apps-sdk` uses `TextEncoder` and `TextDecoder` which are not available in jsdom for some reason
Object.assign(global, { TextDecoder, TextEncoder })

jest.spyOn(Intl, 'NumberFormat').mockImplementation((locale, ...rest) => new NumberFormat([englishTestLocale], ...rest))

// This is required for jest.spyOn to work with imported modules.
// After Next 13, imported modules have `configurable: false` for named exports,
// which means that `jest.spyOn` cannot modify the exported function.
const defineProperty = Object.defineProperty
Object.defineProperty = (obj, prop, desc) => {
  if (prop !== 'prototype') {
    desc.configurable = true
  }
  return defineProperty(obj, prop, desc)
}

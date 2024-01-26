import { connectWallet } from '@/hooks/wallets/useOnboard'
import { chainBuilder } from '@/tests/builders/chains'
import { onboardBuilder } from '@/tests/builders/onboard'
import { faker } from '@faker-js/faker'
import { type SafeAuthPack } from '@safe-global/auth-kit'
import { renderHook, waitFor } from '@testing-library/react'
import {
  setSafeAuthPack,
  useInitSafeAuth,
  _getSafeAuthPackInstance,
  _getSafeAuthUserInfo,
  _setSafeAuthUserInfo,
} from '../useSafeAuth'

const mockChain = chainBuilder().build()
const mockOnboard = onboardBuilder().build()

let registeredListeners: Record<'accountsChanged' | 'chainChanged', Function[]> = {
  accountsChanged: [],
  chainChanged: [],
}

const clearListeners = () => {
  registeredListeners = {
    accountsChanged: [],
    chainChanged: [],
  }
}

const mockSafeAuthPack = {
  signIn: jest.fn(),
  destroy: jest.fn(clearListeners),
  getAddress: jest.fn(),
  getChainId: () => Promise.resolve(BigInt(mockChain.chainId)),
  getProvider: jest.fn(),
  getSafes: jest.fn(),
  getUserInfo: jest.fn(),
  init: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(),
  subscribe: jest.fn().mockImplementation((event: 'accountsChanged' | 'chainChanged', handler: Function) => {
    registeredListeners[event].push(handler)
  }),
  isAuthenticated: false,
  unsubscribe: jest.fn(),
}

jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => mockChain),
  __esModule: true,
}))

jest.mock('@/hooks/wallets/useOnboard', () => ({
  default: jest.fn(() => mockOnboard),
  connectWallet: jest.fn(() => Promise.resolve()),
  getConnectedWallet: jest.fn(),
  __esModule: true,
}))

jest.mock('@safe-global/auth-kit', () => ({
  ...jest.requireActual('@safe-global/auth-kit'),
  SafeAuthPack: jest.fn(() => mockSafeAuthPack),
  __esModule: true,
}))

describe('useInitSafeAuth', () => {
  beforeEach(() => {
    clearListeners()
    setSafeAuthPack(undefined)
    _setSafeAuthUserInfo(undefined)
  })
  it('should initialize and register correct event listeners', async () => {
    renderHook(() => useInitSafeAuth())

    await waitFor(() => {
      expect(_getSafeAuthPackInstance()).toBeDefined()
      expect(mockSafeAuthPack.subscribe).toHaveBeenCalledWith('accountsChanged', expect.anything())
      expect(mockSafeAuthPack.init).toHaveBeenCalled()
    })

    expect(registeredListeners.accountsChanged).toHaveLength(1)

    // Simulate sign-in by emiting calling the accountsChanged handler and mocking the getUserInfo call
    const mockMail = faker.internet.email()
    const mockUserInfo = {
      email: mockMail,
      name: faker.string.alpha(),
      profileImage: faker.internet.url(),
      verifier: 'google',
      verifierId: mockMail,
    }
    mockSafeAuthPack.getUserInfo.mockResolvedValue(mockUserInfo)
    const mockConnectedAccount = faker.finance.ethereumAddress()
    registeredListeners.accountsChanged[0]([mockConnectedAccount])

    // On sign-in we should call connectWallet and set the UserInfo into the ExternalStore
    expect(connectWallet).toHaveBeenCalled()
    await waitFor(() => {
      expect(_getSafeAuthUserInfo()).toEqual(mockUserInfo)
    })
  })

  it('should only init once', async () => {
    const mockDestroy = jest.fn()
    setSafeAuthPack({} as unknown as SafeAuthPack)

    renderHook(() => useInitSafeAuth())

    await waitFor(() => {
      expect(_getSafeAuthPackInstance()).toBeDefined()
      expect(mockSafeAuthPack.init).not.toHaveBeenCalled()
    })
  })
})

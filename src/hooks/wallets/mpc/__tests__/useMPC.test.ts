import * as useOnboard from '@/hooks/wallets/useOnboard'
import { renderHook, waitFor } from '@/tests/test-utils'
import { getMPCCoreKitInstance, setMPCCoreKitInstance, useInitMPC } from '../useMPC'
import * as useChains from '@/hooks/useChains'
import { type ChainInfo, RPC_AUTHENTICATION } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { type Web3AuthMPCCoreKit, COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'

jest.mock('@web3auth/mpc-core-kit', () => ({
  ...jest.requireActual('@web3auth/mpc-core-kit'),
  Web3AuthMPCCoreKit: jest.fn(),
}))

type MPCProvider = Web3AuthMPCCoreKit['provider']

/**
 * Mock for creating and initializing the MPC Core Kit
 */
class MockMPCCoreKit {
  provider: MPCProvider | null = null
  status = COREKIT_STATUS.NOT_INITIALIZED
  private mockState
  private mockProvider

  /**
   * The parameters are set in the mock MPC Core Kit after init() get's called
   *
   * @param mockState
   * @param mockProvider
   */
  constructor(mockState: COREKIT_STATUS, mockProvider: MPCProvider) {
    this.mockState = mockState
    this.mockProvider = mockProvider
  }

  init() {
    this.status = this.mockState
    this.provider = this.mockProvider
    return Promise.resolve()
  }
}

/**
 * Small helper class that implements registering RPC event listeners and event emiting.
 * Used to test that events onboard relies on are getting called correctly
 */
class EventEmittingMockProvider {
  private chainChangedListeners: Function[] = []

  addListener(event: string, listener: Function) {
    if (event === 'chainChanged') {
      this.chainChangedListeners.push(listener)
    }
  }

  emit(event: string, ...args: any[]) {
    this.chainChangedListeners.forEach((listener) => listener(...args))
  }
}

describe('useInitMPC', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('should set the coreKit if user is not logged in yet', async () => {
    const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
    jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
    jest.spyOn(useOnboard, 'getConnectedWallet').mockReturnValue(null)
    jest.spyOn(useOnboard, 'default').mockReturnValue({
      state: {
        get: () => ({
          wallets: [],
          walletModules: [],
        }),
      },
    } as unknown as OnboardAPI)
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      chainId: '5',
      chainName: 'Goerli',
      blockExplorerUriTemplate: {
        address: 'https://goerli.someprovider.io/{address}',
        txHash: 'https://goerli.someprovider.io/{txHash}',
        api: 'https://goerli.someprovider.io/',
      },
      nativeCurrency: {
        decimals: 18,
        logoUri: 'https://logo.goerli.com',
        name: 'Goerli ETH',
        symbol: 'ETH',
      },
      rpcUri: {
        authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
        value: 'https://goerli.somerpc.io',
      },
    } as unknown as ChainInfo)

    const mockWeb3AuthMpcCoreKit = jest.spyOn(require('@web3auth/mpc-core-kit'), 'Web3AuthMPCCoreKit')
    mockWeb3AuthMpcCoreKit.mockImplementation(() => {
      return new MockMPCCoreKit(COREKIT_STATUS.INITIALIZED, null)
    })

    renderHook(() => useInitMPC())

    await waitFor(() => {
      expect(getMPCCoreKitInstance()).toBeDefined()
      expect(connectWalletSpy).not.toBeCalled()
    })
  })

  it('should call connectWallet after rehydrating a web3auth session', async () => {
    const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
    jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
    jest.spyOn(useOnboard, 'getConnectedWallet').mockReturnValue(null)
    jest.spyOn(useOnboard, 'default').mockReturnValue({
      state: {
        get: () => ({
          wallets: [],
          walletModules: [],
        }),
      },
    } as unknown as OnboardAPI)
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      chainId: '5',
      chainName: 'Goerli',
      blockExplorerUriTemplate: {
        address: 'https://goerli.someprovider.io/{address}',
        txHash: 'https://goerli.someprovider.io/{txHash}',
        api: 'https://goerli.someprovider.io/',
      },
      nativeCurrency: {
        decimals: 18,
        logoUri: 'https://logo.goerli.com',
        name: 'Goerli ETH',
        symbol: 'ETH',
      },
      rpcUri: {
        authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
        value: 'https://goerli.somerpc.io',
      },
    } as unknown as ChainInfo)

    const mockWeb3AuthMpcCoreKit = jest.spyOn(require('@web3auth/mpc-core-kit'), 'Web3AuthMPCCoreKit')
    const mockProvider = jest.fn()
    mockWeb3AuthMpcCoreKit.mockImplementation(() => {
      return new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, mockProvider as unknown as MPCProvider)
    })

    renderHook(() => useInitMPC())

    await waitFor(() => {
      expect(connectWalletSpy).toBeCalled()
      expect(getMPCCoreKitInstance()).toBeDefined()
    })
  })

  it('should copy event handlers and emit chainChanged if the current chain is updated', async () => {
    const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
    jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
    jest.spyOn(useOnboard, 'getConnectedWallet').mockReturnValue({
      address: hexZeroPad('0x1', 20),
      label: ONBOARD_MPC_MODULE_LABEL,
      chainId: '1',
      provider: {} as unknown as EIP1193Provider,
    })
    jest.spyOn(useOnboard, 'default').mockReturnValue({
      state: {
        get: () => ({
          wallets: [],
          walletModules: [],
        }),
      },
    } as unknown as OnboardAPI)
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      chainId: '5',
      chainName: 'Goerli',
      blockExplorerUriTemplate: {
        address: 'https://goerli.someprovider.io/{address}',
        txHash: 'https://goerli.someprovider.io/{txHash}',
        api: 'https://goerli.someprovider.io/',
      },
      nativeCurrency: {
        decimals: 18,
        logoUri: 'https://logo.goerli.com',
        name: 'Goerli ETH',
        symbol: 'ETH',
      },
      rpcUri: {
        authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
        value: 'https://goerli.somerpc.io',
      },
    } as unknown as ChainInfo)

    const mockWeb3AuthMpcCoreKit = jest.spyOn(require('@web3auth/mpc-core-kit'), 'Web3AuthMPCCoreKit')
    const mockChainChangedListener = jest.fn()
    const mockProviderBefore = {
      listeners: (eventName: string) => {
        if (eventName === 'chainChanged') {
          return [mockChainChangedListener]
        }
      },
    }

    setMPCCoreKitInstance({
      provider: mockProviderBefore,
    } as unknown as Web3AuthMPCCoreKit)

    const mockProvider = new EventEmittingMockProvider()
    mockWeb3AuthMpcCoreKit.mockImplementation(() => {
      return new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, mockProvider as unknown as MPCProvider)
    })

    renderHook(() => useInitMPC())

    await waitFor(() => {
      expect(mockChainChangedListener).toHaveBeenCalledWith('0x5')
      expect(getMPCCoreKitInstance()).toBeDefined()
      expect(connectWalletSpy).not.toBeCalled()
    })
  })
})

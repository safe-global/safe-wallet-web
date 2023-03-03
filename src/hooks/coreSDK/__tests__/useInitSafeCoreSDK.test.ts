import { renderHook } from '@/tests/test-utils'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import * as coreSDK from '@/hooks/coreSDK/safeCoreSDK'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useOnboard from '@/hooks/wallets/useOnboard'
import * as web3 from '../../wallets/web3'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { EIP1193Provider, OnboardAPI } from '@web3-onboard/core'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { act } from '@testing-library/react'
import type Safe from '@safe-global/safe-core-sdk'

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  useCurrentChain: jest.fn(() => ({
    chainName: 'Goerli',
    chainId: '5',
    rpcUri: { value: 'https://goerli.infura.io/v3/123', authentification: 'none' },
  })),
}))

describe('useInitSafeCoreSDK hook', () => {
  const mockSafeInfo = {
    safe: {
      chainId: '5',
      address: {
        value: '0x1',
      },
      version: '1.3.0',
    } as SafeInfo,
    safeAddress: '0x1',
    safeLoaded: false,
    safeError: undefined,
    safeLoading: true,
  }

  const mockWallet = {
    address: '',
    chainId: '5',
    label: '',
    provider: null as unknown as EIP1193Provider,
  }

  const mockOnboard = {
    disconnectWallet: jest.fn(),
  } as unknown as OnboardAPI

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(useSafeInfo, 'default').mockReturnValue(mockSafeInfo)
    jest.spyOn(useWallet, 'default').mockReturnValue(mockWallet)
    jest.spyOn(useOnboard, 'default').mockReturnValue(mockOnboard)
  })

  it('initializes a Core SDK instance', async () => {
    const mockSafe = {} as Safe
    const initMock = jest.spyOn(coreSDK, 'initSafeSDK').mockReturnValue(Promise.resolve(mockSafe))
    const setSDKMock = jest.spyOn(coreSDK, 'setSafeSDK')

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({} as unknown as JsonRpcProvider)
    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider })
    jest.spyOn(useSafeInfo, 'default').mockReturnValueOnce({
      ...mockSafeInfo,
      safeLoaded: true,
    })

    renderHook(() => useInitSafeCoreSDK())

    expect(initMock).toHaveBeenCalledWith({}, {}, '5', '5', '0x1', '1.3.0')

    await act(() => Promise.resolve())

    expect(setSDKMock).toHaveBeenCalledWith(mockSafe)
  })

  it('does not initialize a Core SDK instance if the safe info is not loaded', () => {
    const initMock = jest.spyOn(coreSDK, 'initSafeSDK')
    const setSDKMock = jest.spyOn(coreSDK, 'setSafeSDK')

    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider })

    renderHook(() => useInitSafeCoreSDK())

    expect(initMock).not.toHaveBeenCalled()
    expect(setSDKMock).toHaveBeenCalledWith(undefined)
  })
})

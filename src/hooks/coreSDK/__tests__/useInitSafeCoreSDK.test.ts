import { renderHook } from '@/tests/test-utils'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import * as coreSDK from '@/hooks/coreSDK/safeCoreSDK'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useOnboard from '@/hooks/wallets/useOnboard'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { EIP1193Provider, OnboardAPI } from '@web3-onboard/core'
import { act } from '@testing-library/react'
import type Safe from '@safe-global/safe-core-sdk'

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

    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider })
    jest.spyOn(useSafeInfo, 'default').mockReturnValueOnce({
      ...mockSafeInfo,
      safeLoaded: true,
    })

    renderHook(() => useInitSafeCoreSDK())

    expect(initMock).toHaveBeenCalledWith({}, '5', '0x1', '1.3.0')

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

  it('does not initialize a Core SDK instance if there is no safe chainId', () => {
    const initMock = jest.spyOn(coreSDK, 'initSafeSDK')
    const setSDKMock = jest.spyOn(coreSDK, 'setSafeSDK')

    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider, chainId: '5' })
    jest.spyOn(useSafeInfo, 'default').mockReturnValueOnce({
      ...mockSafeInfo,
      safe: {
        ...mockSafeInfo.safe,
        chainId: '',
      } as SafeInfo,
      safeLoaded: true,
    })

    renderHook(() => useInitSafeCoreSDK())

    expect(initMock).not.toHaveBeenCalled()
    expect(setSDKMock).toHaveBeenCalledWith(undefined)
  })

  it('does not initialize a Core SDK instance if the safe chainId and wallet chainId are different', () => {
    const initMock = jest.spyOn(coreSDK, 'initSafeSDK')
    const setSDKMock = jest.spyOn(coreSDK, 'setSafeSDK')

    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider, chainId: '1' })
    jest.spyOn(useSafeInfo, 'default').mockReturnValueOnce({
      ...mockSafeInfo,
      safe: {
        ...mockSafeInfo.safe,
        chainId: '5',
      } as SafeInfo,
      safeLoaded: true,
    })

    renderHook(() => useInitSafeCoreSDK())

    expect(initMock).not.toHaveBeenCalled()
    expect(setSDKMock).toHaveBeenCalledWith(undefined)
  })
})

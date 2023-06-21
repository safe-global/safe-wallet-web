import { act, renderHook, waitFor } from '@/tests/test-utils'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { REDEFINE_RETRY_TIMEOUT, useRedefine } from './useRedefine'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useChains from '@/hooks/useChains'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { hexZeroPad } from 'ethers/lib/utils'
import { type RedefineResponse, REDEFINE_ERROR_CODES } from '@/services/security/modules/RedefineModule'
import { SecuritySeverity } from '@/services/security/modules/types'

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

describe('useRedefine', () => {
  let mockUseWallet: jest.SpyInstance<ConnectedWallet | null, []>

  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    mockUseWallet = jest.spyOn(useWallet, 'default')
    mockUseWallet.mockImplementation(() => null)

    global.fetch = jest.fn()
  })
  it('should return undefined without safeTx', async () => {
    const { result } = renderHook(() => useRedefine(undefined))

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined()
      expect(result.current[1]).toBeUndefined()
      expect(result.current[2]).toBeFalsy()
    })
  })

  it('should return undefined without connected wallet', async () => {
    const safeTx: SafeTransaction = {
      data: {
        baseGas: 0,
        data: '0x',
        gasPrice: 0,
        gasToken: ZERO_ADDRESS,
        nonce: 0,
        operation: 0,
        refundReceiver: ZERO_ADDRESS,
        safeTxGas: 0,
        to: ZERO_ADDRESS,
        value: '0',
      },
      signatures: new Map(),
      addSignature: () => {},
      encodedSignatures: () => '',
    }

    const { result } = renderHook(() => useRedefine(safeTx))

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined()
      expect(result.current[1]).toBeUndefined()
      expect(result.current[2]).toBeFalsy()
    })
  })

  it('should return undefined without feature enabled', async () => {
    const walletAddress = hexZeroPad('0x1', 20)
    const safeTx: SafeTransaction = {
      data: {
        baseGas: 0,
        data: '0x',
        gasPrice: 0,
        gasToken: ZERO_ADDRESS,
        nonce: 0,
        operation: 0,
        refundReceiver: ZERO_ADDRESS,
        safeTxGas: 0,
        to: ZERO_ADDRESS,
        value: '0',
      },
      signatures: new Map(),
      addSignature: () => {},
      encodedSignatures: () => '',
    }

    mockUseWallet.mockImplementation(() => ({
      address: walletAddress,
      chainId: '1',
      label: 'Testwallet',
      provider: {} as any,
    }))

    jest.spyOn(useChains, 'useHasFeature').mockReturnValue(false)

    const { result } = renderHook(() => useRedefine(safeTx))

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined()
      expect(result.current[1]).toEqual(undefined)
      expect(result.current[2]).toBeFalsy()
    })
  })

  it('should handle request errors', async () => {
    const walletAddress = hexZeroPad('0x1', 20)
    const safeTx: SafeTransaction = {
      data: {
        baseGas: 0,
        data: '0x',
        gasPrice: 0,
        gasToken: ZERO_ADDRESS,
        nonce: 0,
        operation: 0,
        refundReceiver: ZERO_ADDRESS,
        safeTxGas: 0,
        to: ZERO_ADDRESS,
        value: '0',
      },
      signatures: new Map(),
      addSignature: () => {},
      encodedSignatures: () => '',
    }

    mockUseWallet.mockImplementation(() => ({
      address: walletAddress,
      chainId: '1',
      label: 'Testwallet',
      provider: {} as any,
    }))

    jest.spyOn(useChains, 'useHasFeature').mockReturnValue(true)

    const mockFetch = jest.spyOn(global, 'fetch')
    mockFetch.mockImplementation(() => Promise.reject({ message: '403 not authorized' }))

    const { result } = renderHook(() => useRedefine(safeTx))

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined()
      expect(result.current[1]).toEqual(new Error('Unavailable'))
      expect(result.current[2]).toBeFalsy()
    })
  })

  it('should return the redefine issues', async () => {
    const walletAddress = hexZeroPad('0x1', 20)
    const safeTx: SafeTransaction = {
      data: {
        baseGas: 0,
        data: '0x',
        gasPrice: 0,
        gasToken: ZERO_ADDRESS,
        nonce: 0,
        operation: 0,
        refundReceiver: ZERO_ADDRESS,
        safeTxGas: 0,
        to: ZERO_ADDRESS,
        value: '0',
      },
      signatures: new Map(),
      addSignature: () => {},
      encodedSignatures: () => '',
    }

    const mockRedefineResponse: RedefineResponse = {
      data: {
        insights: {
          verdict: {
            code: 1,
            label: 'LOW',
          },
          issues: [
            {
              category: 'SOME_FAKE_WARNING',
              description: {
                short: 'Test',
                long: 'Just a test',
              },
              severity: {
                code: 1,
                label: 'LOW',
              },
            },
          ],
        },
        simulation: {
          block: '123',
          time: '2023-01-01-23:00',
          uuid: '123-456-789',
        },
        balanceChange: {
          in: [
            {
              address: hexZeroPad('0x2', 20),
              amount: {
                normalizedValue: '0.1',
                value: '100000000000000000',
              },
              decimals: 18,
              name: 'Test',
              symbol: 'TST',
              type: 'ERC20',
            },
          ],
          out: [],
        },
      },
      errors: [],
    }

    mockUseWallet.mockImplementation(() => ({
      address: walletAddress,
      chainId: '1',
      label: 'Testwallet',
      provider: {} as any,
    }))

    jest.spyOn(useChains, 'useHasFeature').mockReturnValue(true)

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockRedefineResponse))

    const mockFetch = jest.spyOn(global, 'fetch')
    const { result } = renderHook(() => useRedefine(safeTx))

    await waitFor(() => {
      expect(result.current[0]).toBeDefined()
      const response = result.current[0]
      expect(response?.severity).toEqual(SecuritySeverity.LOW)
      expect(response?.payload?.issues).toHaveLength(1)
      expect(response?.payload?.balanceChange?.in).toHaveLength(1)
      expect(result.current[1]).toBeUndefined()
      expect(result.current[2]).toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Should not poll again without error 1000
    await act(() => {
      jest.advanceTimersByTime(REDEFINE_RETRY_TIMEOUT)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should poll again on error code 1000', async () => {
    const walletAddress = hexZeroPad('0x1', 20)
    const safeTx: SafeTransaction = {
      data: {
        baseGas: 0,
        data: '0x',
        gasPrice: 0,
        gasToken: ZERO_ADDRESS,
        nonce: 0,
        operation: 0,
        refundReceiver: ZERO_ADDRESS,
        safeTxGas: 0,
        to: ZERO_ADDRESS,
        value: '0',
      },
      signatures: new Map(),
      addSignature: () => {},
      encodedSignatures: () => '',
    }

    const mockPartialRedefineResponse: RedefineResponse = {
      data: {
        insights: {
          verdict: {
            code: 1,
            label: 'LOW',
          },
          issues: [
            {
              category: 'SOME_FAKE_WARNING',
              description: {
                short: 'Test',
                long: 'Just a test',
              },
              severity: {
                code: 1,
                label: 'LOW',
              },
            },
          ],
        },
        simulation: {
          block: '123',
          time: '2023-01-01-23:00',
          uuid: '123-456-789',
        },
      },
      errors: [
        {
          code: REDEFINE_ERROR_CODES.ANALYSIS_IN_PROGRESS,
          message: 'Analysis still in progress.',
        },
      ],
    }

    const mockFullRedefineResponse: RedefineResponse = {
      data: {
        balanceChange: {
          in: [
            {
              address: hexZeroPad('0x2', 20),
              amount: {
                normalizedValue: '0.1',
                value: '100000000000000000',
              },
              decimals: 18,
              name: 'Test',
              symbol: 'TST',
              type: 'ERC20',
            },
          ],
          out: [],
        },
        simulation: {
          block: '123',
          time: '2023-01-01-23:00',
          uuid: '123-456-789',
        },
        insights: {
          verdict: {
            code: 1,
            label: 'LOW',
          },
          issues: [
            {
              category: 'SOME_FAKE_WARNING',
              description: {
                short: 'Test',
                long: 'Just a test',
              },
              severity: {
                code: 1,
                label: 'LOW',
              },
            },
          ],
        },
      },
      errors: [],
    }

    mockUseWallet.mockImplementation(() => ({
      address: walletAddress,
      chainId: '1',
      label: 'Testwallet',
      provider: {} as any,
    }))

    jest.spyOn(useChains, 'useHasFeature').mockReturnValue(true)

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockPartialRedefineResponse))

    let mockFetch = jest.spyOn(global, 'fetch')
    const { result } = renderHook(() => useRedefine(safeTx))

    await waitFor(() => {
      expect(result.current[0]).toBeDefined()
      const response = result.current[0]
      expect(response?.severity).toEqual(SecuritySeverity.LOW)
      expect(response?.payload?.issues).toHaveLength(1)
      expect(response?.payload?.balanceChange).toBeUndefined()
      expect(result.current[1]).toBeUndefined()
      expect(result.current[2]).toBeTruthy()

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockFullRedefineResponse))

    mockFetch = jest.spyOn(global, 'fetch')

    // Should poll again on error 1000
    await act(() => {
      jest.advanceTimersByTime(REDEFINE_RETRY_TIMEOUT)
    })

    await waitFor(() => {
      expect(result.current[0]).toBeDefined()
      const response = result.current[0]
      expect(response?.severity).toEqual(SecuritySeverity.LOW)
      expect(response?.payload?.issues).toHaveLength(1)
      expect(response?.payload?.balanceChange?.in).toHaveLength(1)
      expect(result.current[1]).toBeUndefined()
      expect(result.current[2]).toBeFalsy()

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Should not poll again after full result without error 1000
    // Should not poll again without error 1000
    await act(() => {
      jest.advanceTimersByTime(REDEFINE_RETRY_TIMEOUT)
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

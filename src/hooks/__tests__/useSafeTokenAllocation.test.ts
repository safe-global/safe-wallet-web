import { renderHook, waitFor } from '@/tests/test-utils'
import { hexZeroPad, keccak256, parseEther, toUtf8Bytes } from 'ethers/lib/utils'
import useSafeTokenAllocation from '../useSafeTokenAllocation'
import * as web3 from '../wallets/web3'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'

const setupFetchStub =
  (data: any, status: number = 200) =>
  (_url: string) => {
    return Promise.resolve({
      json: () => Promise.resolve(data),
      status,
      ok: status === 200,
    })
  }

describe('useSafeTokenAllocation', () => {
  afterEach(() => {
    //@ts-ignore
    global.fetch?.mockClear?.()
  })

  afterAll(() => {
    // @ts-ignore
    delete global.fetch
  })

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(
      () =>
        ({
          safeAddress: hexZeroPad('0x2', 20),
          safe: {
            address: hexZeroPad('0x2', 20),
            chainId: '1',
          },
        } as any),
    )
  })

  test('return undefined without safe address', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(
      () =>
        ({
          safeAddress: undefined,
          safe: {
            address: undefined,
            chainId: '1',
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(result.current[1]).toBeFalsy()
      expect(result.current[0]).toBeUndefined()
    })
  })

  test('return 0 without web3Provider', async () => {
    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(result.current[1]).toBeFalsy()
      expect(result.current[0]?.toNumber()).toEqual(0)
    })
  })

  test('return 0 if no allocations / balances exist', async () => {
    global.fetch = jest.fn().mockImplementation(setupFetchStub('', 404))
    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const sigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            if (transaction.data?.startsWith(sigHash)) {
              return Promise.resolve('0x0')
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const mockFetch = jest.spyOn(global, 'fetch')

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(result.current[0]?.toNumber()).toEqual(0)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('return balance if no allocation exists', async () => {
    global.fetch = jest.fn().mockImplementation(setupFetchStub('', 404))
    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const sigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            if (transaction.data?.startsWith(sigHash)) {
              return Promise.resolve(parseEther('100').toHexString())
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const mockFetch = jest.spyOn(global, 'fetch')

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      console.log(result.current[0]?.toString())
      expect(result.current[0]?.eq(parseEther('100'))).toBeTruthy()
      expect(result.current[1]).toBeFalsy()
    })
  })
})

import { renderHook, waitFor } from '@/tests/test-utils'
import { defaultAbiCoder, hexZeroPad, keccak256, parseEther, toUtf8Bytes } from 'ethers/lib/utils'
import useSafeTokenAllocation from '../useSafeTokenAllocation'
import * as web3 from '../wallets/web3'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { BigNumber } from 'ethers'

const setupFetchStub =
  (data: any, status: number = 200) =>
  (_url: string) => {
    return Promise.resolve({
      json: () => Promise.resolve(data),
      status,
      ok: status === 200,
    })
  }

// TODO: use mockWeb3Provider()
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
    global.fetch = jest.fn().mockImplementation(setupFetchStub('', 404))
    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(result.current[1]).toBeFalsy()
      expect(result.current[0]?.toNumber()).toEqual(0)
    })
  })

  test('return 0 if no allocations / balances exist', async () => {
    global.fetch = jest.fn().mockImplementation(setupFetchStub('', 404))
    const mockFetch = jest.spyOn(global, 'fetch')
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

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(0)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('return balance if no allocation exists', async () => {
    global.fetch = jest.fn().mockImplementation(setupFetchStub('', 404))
    const mockFetch = jest.spyOn(global, 'fetch')

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

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.eq(parseEther('100'))).toBeTruthy()
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('always return allocation if it is rededeemed', async () => {
    const mockAllocation = [
      {
        tag: 'user',
        account: hexZeroPad('0x2', 20),
        chainId: 1,
        contract: hexZeroPad('0xabc', 20),
        vestingId: hexZeroPad('0x4110', 32),
        durationWeeks: 208,
        startDate: 1657231200,
        amount: '2000',
        curve: 0,
        proof: [],
      },
    ]

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAllocation, 200))
    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const balanceOfSigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            const vestingsSigHash = keccak256(toUtf8Bytes('vestings(bytes32)')).slice(0, 10)

            if (transaction.data?.startsWith(balanceOfSigHash)) {
              return Promise.resolve(parseEther('0').toHexString())
            }
            if (transaction.data?.startsWith(vestingsSigHash)) {
              return Promise.resolve(
                defaultAbiCoder.encode(
                  ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
                  [hexZeroPad('0x2', 20), '0x1', false, 208, 1657231200, 2000, 0, 0, false],
                ),
              )
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(2000)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('ignore not redeemed allocations if deadline has passed', async () => {
    const mockAllocation = [
      {
        tag: 'user',
        account: hexZeroPad('0x2', 20),
        chainId: 1,
        contract: hexZeroPad('0xabc', 20),
        vestingId: hexZeroPad('0x4110', 32),
        durationWeeks: 208,
        startDate: 1657231200,
        amount: '2000',
        curve: 0,
        proof: [],
      },
    ]

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAllocation, 200))
    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const balanceOfSigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            const vestingsSigHash = keccak256(toUtf8Bytes('vestings(bytes32)')).slice(0, 10)
            const redeemDeadlineSigHash = keccak256(toUtf8Bytes('redeemDeadline()')).slice(0, 10)

            if (transaction.data?.startsWith(balanceOfSigHash)) {
              return Promise.resolve(parseEther('0').toHexString())
            }
            if (transaction.data?.startsWith(vestingsSigHash)) {
              return Promise.resolve(
                defaultAbiCoder.encode(
                  ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
                  [ZERO_ADDRESS, 0, false, 0, 0, 0, 0, 0, false],
                ),
              )
            }
            if (transaction.data?.startsWith(redeemDeadlineSigHash)) {
              // 30th Nov 2022
              return Promise.resolve(defaultAbiCoder.encode(['uint64'], [1669766400]))
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(0)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('add not redeemed allocations if deadline has not passed', async () => {
    const mockAllocation = [
      {
        tag: 'user',
        account: hexZeroPad('0x2', 20),
        chainId: 1,
        contract: hexZeroPad('0xabc', 20),
        vestingId: hexZeroPad('0x4110', 32),
        durationWeeks: 208,
        startDate: 1657231200,
        amount: '2000',
        curve: 0,
        proof: [],
      },
    ]

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAllocation, 200))
    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const balanceOfSigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            const vestingsSigHash = keccak256(toUtf8Bytes('vestings(bytes32)')).slice(0, 10)
            const redeemDeadlineSigHash = keccak256(toUtf8Bytes('redeemDeadline()')).slice(0, 10)

            if (transaction.data?.startsWith(balanceOfSigHash)) {
              return Promise.resolve(parseEther('0').toHexString())
            }
            if (transaction.data?.startsWith(vestingsSigHash)) {
              return Promise.resolve(
                defaultAbiCoder.encode(
                  ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
                  [ZERO_ADDRESS, 0, false, 0, 0, 0, 0, 0, false],
                ),
              )
            }
            if (transaction.data?.startsWith(redeemDeadlineSigHash)) {
              // 08.Dec 2200
              return Promise.resolve(defaultAbiCoder.encode(['uint64'], [7287610110]))
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(2000)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('test formula: allocation - claimed + balance', async () => {
    const mockAllocation = [
      {
        tag: 'user',
        account: hexZeroPad('0x2', 20),
        chainId: 1,
        contract: hexZeroPad('0xabc', 20),
        vestingId: hexZeroPad('0x4110', 32),
        durationWeeks: 208,
        startDate: 1657231200,
        amount: '2000',
        curve: 0,
        proof: [],
      },
    ]

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAllocation, 200))
    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const balanceOfSigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            const vestingsSigHash = keccak256(toUtf8Bytes('vestings(bytes32)')).slice(0, 10)
            const redeemDeadlineSigHash = keccak256(toUtf8Bytes('redeemDeadline()')).slice(0, 10)

            if (transaction.data?.startsWith(balanceOfSigHash)) {
              return Promise.resolve(BigNumber.from('400').toHexString())
            }
            if (transaction.data?.startsWith(vestingsSigHash)) {
              return Promise.resolve(
                defaultAbiCoder.encode(
                  ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
                  // 1000 of 2000 tokens are claimed
                  [hexZeroPad('0x2', 20), '0x1', false, 208, 1657231200, 2000, 1000, 0, false],
                ),
              )
            }
            if (transaction.data?.startsWith(redeemDeadlineSigHash)) {
              // 08.Dec 2200
              return Promise.resolve(defaultAbiCoder.encode(['uint64'], [7287610110]))
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(2000 - 1000 + 400)
      expect(result.current[1]).toBeFalsy()
    })
  })

  test('test formula: allocation - claimed + balance, everything claimed and no balance', async () => {
    const mockAllocation = [
      {
        tag: 'user',
        account: hexZeroPad('0x2', 20),
        chainId: 1,
        contract: hexZeroPad('0xabc', 20),
        vestingId: hexZeroPad('0x4110', 32),
        durationWeeks: 208,
        startDate: 1657231200,
        amount: '2000',
        curve: 0,
        proof: [],
      },
    ]

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAllocation, 200))
    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
      () =>
        ({
          call: (transaction: any, blockTag?: any) => {
            const balanceOfSigHash = keccak256(toUtf8Bytes('balanceOf(address)')).slice(0, 10)
            const vestingsSigHash = keccak256(toUtf8Bytes('vestings(bytes32)')).slice(0, 10)
            const redeemDeadlineSigHash = keccak256(toUtf8Bytes('redeemDeadline()')).slice(0, 10)

            if (transaction.data?.startsWith(balanceOfSigHash)) {
              return Promise.resolve(BigNumber.from('0').toHexString())
            }
            if (transaction.data?.startsWith(vestingsSigHash)) {
              return Promise.resolve(
                defaultAbiCoder.encode(
                  ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
                  // 1000 of 2000 tokens are claimed
                  [hexZeroPad('0x2', 20), '0x1', false, 208, 1657231200, 2000, 2000, 0, false],
                ),
              )
            }
            if (transaction.data?.startsWith(redeemDeadlineSigHash)) {
              // 08.Dec 2200
              return Promise.resolve(defaultAbiCoder.encode(['uint64'], [7287610110]))
            }
            return Promise.resolve('0x')
          },
        } as any),
    )

    const { result } = renderHook(() => useSafeTokenAllocation())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(result.current[0]?.toNumber()).toEqual(0)
      expect(result.current[1]).toBeFalsy()
    })
  })
})

import { BigNumber } from 'ethers'
import { act, renderHook } from '@/tests/test-utils'
import useGasPrice from '@/hooks/useGasPrice'

// mock useWeb3Readonly
jest.mock('../wallets/web3', () => {
  const provider = {
    getFeeData: jest.fn(() =>
      Promise.resolve({
        gasPrice: undefined,
        maxFeePerGas: BigNumber.from('0x956e'),
        maxPriorityFeePerGas: BigNumber.from('0x136f'),
      }),
    ),
  }
  return {
    useWeb3ReadOnly: jest.fn(() => provider),
  }
})

// Mock useCurrentChain
jest.mock('@/hooks/useChains', () => {
  const currentChain = {
    chainId: '4',
    gasPrice: [
      {
        type: 'ORACLE',
        uri: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
        gasParameter: 'FastGasPrice',
        gweiFactor: '1000000000.000000000',
      },
      {
        type: 'ORACLE',
        uri: 'https://ethgasstation.info/json/ethgasAPI.json',
        gasParameter: 'fast',
        gweiFactor: '200000000.000000000',
      },
      {
        type: 'FIXED',
        weiValue: '24000000000',
      },
    ],
    features: ['EIP1559'],
  }

  return {
    useCurrentChain: jest.fn(() => currentChain),
  }
})

describe('useGasPrice', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  it('should return the fetched gas price from the first oracle', async () => {
    // Mock fetch
    Object.defineProperty(window, 'fetch', {
      writable: true,
      value: jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                FastGasPrice: 47,
              },
            }),
        }),
      ),
    })

    // render the hook
    const { result } = renderHook(() => useGasPrice())

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')

    // assert the gas price is correct
    expect(result.current.maxFeePerGas?.toString()).toBe('47000000000')

    // assert the priority fee is correct
    expect(result.current.maxPriorityFeePerGas?.toString()).toEqual('4975')
  })

  it('should return the fetched gas price from the second oracle if the first one fails', async () => {
    // Mock fetch
    jest.spyOn(window, 'fetch').mockImplementation(
      jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')))
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                result: {
                  fast: 300,
                },
              }),
          }),
        ),
    )

    // render the hook
    const { result } = renderHook(() => useGasPrice())

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
    expect(fetch).toHaveBeenCalledWith('https://ethgasstation.info/json/ethgasAPI.json')

    // assert the gas price is correct
    expect(result.current.maxFeePerGas?.toString()).toBe('60000000000')

    // assert the priority fee is correct
    expect(result.current.maxPriorityFeePerGas?.toString()).toEqual('4975')
  })

  it('should fallback to a fixed gas price if the oracles fail', async () => {
    // Mock fetch
    jest.spyOn(window, 'fetch').mockImplementation(
      jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')))
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch'))),
    )

    // render the hook
    const { result } = renderHook(() => useGasPrice())

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
    expect(fetch).toHaveBeenCalledWith('https://ethgasstation.info/json/ethgasAPI.json')

    // assert the gas price is correct
    expect(result.current.maxFeePerGas?.toString()).toBe('24000000000')

    // assert the priority fee is correct
    expect(result.current.maxPriorityFeePerGas?.toString()).toEqual('4975')
  })

  it('should keep the previous gas price if the hook re-renders', async () => {
    // Mock fetch
    Object.defineProperty(window, 'fetch', {
      writable: true,
      value: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: {
                  FastGasPrice: 21,
                },
              }),
          }),
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: {
                  FastGasPrice: 22,
                },
              }),
          }),
        ),
    })

    // render the hook
    const { result } = renderHook(() => useGasPrice())

    expect(result.current.maxFeePerGas).toBe(undefined)

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.maxFeePerGas?.toString()).toBe('21000000000')

    // render the hook again
    const { result: result2 } = renderHook(() => useGasPrice())

    expect(result.current.maxFeePerGas?.toString()).toBe('21000000000')

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(result2.current.maxFeePerGas?.toString()).toBe('22000000000')
  })
})

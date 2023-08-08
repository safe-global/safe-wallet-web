import { BigNumber } from 'ethers'
import { act, renderHook } from '@/tests/test-utils'
import useGasPrice from '@/hooks/useGasPrice'
import { useCurrentChain } from '../useChains'

// mock useWeb3Readonly
jest.mock('../wallets/web3', () => {
  const provider = {
    getFeeData: jest.fn(() =>
      Promise.resolve({
        gasPrice: undefined,
        maxFeePerGas: BigNumber.from('0x956e'), //38254
        maxPriorityFeePerGas: BigNumber.from('0x136f'), //4975
      }),
    ),
  }
  return {
    useWeb3ReadOnly: jest.fn(() => provider),
  }
})

// Mock useCurrentChain
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
jest.mock('@/hooks/useChains', () => {
  return {
    useCurrentChain: jest.fn(() => currentChain),
  }
})

describe('useGasPrice', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    ;(useCurrentChain as jest.Mock).mockReturnValue(currentChain)
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

    // assert the hook is loading
    expect(result.current[2]).toBe(true)

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')

    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    // assert the gas price is correct
    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('47000000000')

    // assert the priority fee is correct
    expect(result.current[0]?.maxPriorityFeePerGas?.toString()).toEqual('4975')
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

    // assert the hook is loading
    expect(result.current[2]).toBe(true)

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
    expect(fetch).toHaveBeenCalledWith('https://ethgasstation.info/json/ethgasAPI.json')

    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    // assert the gas price is correct
    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('60000000000')

    // assert the priority fee is correct
    expect(result.current[0]?.maxPriorityFeePerGas?.toString()).toEqual('4975')
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

    // assert the hook is loading
    expect(result.current[2]).toBe(true)

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
    expect(fetch).toHaveBeenCalledWith('https://ethgasstation.info/json/ethgasAPI.json')

    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    // assert the gas price is correct
    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('24000000000')

    // assert the priority fee is correct
    expect(result.current[0]?.maxPriorityFeePerGas?.toString()).toEqual('4975')
  })

  it("should use the previous block's fee data if there are no oracles", async () => {
    ;(useCurrentChain as jest.Mock).mockReturnValue({
      chainId: '1',
      gasPrice: [],
      features: ['EIP1559'],
    })

    const { result } = renderHook(() => useGasPrice())

    await act(async () => {
      await Promise.resolve()
    })
    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    // assert gas price from provider
    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('38254')

    // assert priority fee from provider
    expect(result.current[0]?.maxPriorityFeePerGas?.toString()).toBe('4975')
  })

  it('should use a minimum max fee per gas of 0.1 gwei on optimism', async () => {
    ;(useCurrentChain as jest.Mock).mockReturnValue({
      chainId: '10',
      gasPrice: [],
      features: ['EIP1559'],
    })

    const { result } = renderHook(() => useGasPrice())

    await act(async () => {
      await Promise.resolve()
    })
    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    // assert gas price as minimum of 0.1 gwei
    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('100000000')

    // assert priority fee from provider
    expect(result.current[0]?.maxPriorityFeePerGas?.toString()).toBe('4975')
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

    // assert the hook is loading
    expect(result.current[2]).toBe(true)

    expect(result.current[0]?.maxFeePerGas).toBe(undefined)

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('21000000000')

    // render the hook again
    const { result: result2 } = renderHook(() => useGasPrice())

    // assert the hook is not loading (as a value exists)
    expect(result.current[2]).toBe(false)

    expect(result.current[0]?.maxFeePerGas?.toString()).toBe('21000000000')

    // wait for the hook to fetch the gas price
    await act(async () => {
      await Promise.resolve()
    })

    // assert the hook is not loading
    expect(result.current[2]).toBe(false)

    expect(result2.current[0]?.maxFeePerGas?.toString()).toBe('22000000000')
  })
})

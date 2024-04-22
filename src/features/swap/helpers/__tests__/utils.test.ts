import { getExecutionPrice, getLimitPrice, getSurplusPrice } from '../utils'
import { type SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'

describe('Swap helpers', () => {
  test('sellAmount bigger than buyAmount', () => {
    const mockOrder = {
      executedSellAmount: '100000000000000000000', // 100 tokens
      executedBuyAmount: '50000000000000000000', // 50 tokens
      buyToken: { decimals: 18 },
      sellToken: { decimals: 18 },
      sellAmount: '100000000000000000000',
      buyAmount: '50000000000000000000',
    } as unknown as SwapOrder

    const executionPrice = getExecutionPrice(mockOrder)
    const limitPrice = getLimitPrice(mockOrder)
    const surplusPrice = getSurplusPrice(mockOrder)

    expect(executionPrice).toBe(2)
    expect(limitPrice).toBe(2)
    expect(surplusPrice).toBe(0)
  })

  test('sellAmount smaller than buyAmount', () => {
    const mockOrder = {
      executedSellAmount: '50000000000000000000', // 50 tokens
      executedBuyAmount: '100000000000000000000', // 100 tokens
      buyToken: { decimals: 18 },
      sellToken: { decimals: 18 },
      sellAmount: '50000000000000000000',
      buyAmount: '100000000000000000000',
    } as unknown as SwapOrder

    const executionPrice = getExecutionPrice(mockOrder)
    const limitPrice = getLimitPrice(mockOrder)
    const surplusPrice = getSurplusPrice(mockOrder)

    expect(executionPrice).toBe(0.5)
    expect(limitPrice).toBe(0.5)
    expect(surplusPrice).toBe(0)
  })

  test('buyToken has more decimals than sellToken', () => {
    const mockOrder = {
      executedSellAmount: '10000000000', // 100 tokens
      executedBuyAmount: '50000000000000000000', // 50 tokens
      buyToken: { decimals: 18 },
      sellToken: { decimals: 8 },
      sellAmount: '10000000000',
      buyAmount: '50000000000000000000',
    } as unknown as SwapOrder

    const executionPrice = getExecutionPrice(mockOrder)
    const limitPrice = getLimitPrice(mockOrder)
    const surplusPrice = getSurplusPrice(mockOrder)

    expect(executionPrice).toBe(2)
    expect(limitPrice).toBe(2)
    expect(surplusPrice).toBe(0)
  })

  test('sellToken has more decimals than buyToken', () => {
    const mockOrder = {
      executedSellAmount: '100000000000000000000', // 100 tokens
      executedBuyAmount: '5000000000', // 50 tokens
      buyToken: { decimals: 8 },
      sellToken: { decimals: 18 },
      sellAmount: '100000000000000000000',
      buyAmount: '5000000000',
    } as unknown as SwapOrder

    const executionPrice = getExecutionPrice(mockOrder)
    const limitPrice = getLimitPrice(mockOrder)
    const surplusPrice = getSurplusPrice(mockOrder)

    expect(executionPrice).toBe(2)
    expect(limitPrice).toBe(2)
    expect(surplusPrice).toBe(0)
  })
})

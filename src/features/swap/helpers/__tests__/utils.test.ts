import {
  getExecutionPrice,
  getFilledPercentage,
  getLimitPrice,
  getSurplusPrice,
  isOrderPartiallyFilled,
} from '../utils'
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

  describe('getFilledPercentage', () => {
    it('returns 0 if no amount was executed', () => {
      const mockOrder = {
        executedSellAmount: '0',
        executedBuyAmount: '0',
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '100000000000000000000',
        buyAmount: '5000000000',
      } as unknown as SwapOrder

      const result = getFilledPercentage(mockOrder)

      expect(result).toEqual('0')
    })

    it('returns the percentage for buy orders', () => {
      const mockOrder = {
        executedSellAmount: '10000000000000000000',
        executedBuyAmount: '50000000',
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '100000000000000000000',
        buyAmount: '5000000000',
        kind: 'buy',
      } as unknown as SwapOrder

      const result = getFilledPercentage(mockOrder)

      expect(result).toEqual('1')
    })

    it('returns the percentage for sell orders', () => {
      const mockOrder = {
        executedSellAmount: '10000000000000000000',
        executedBuyAmount: '50000000',
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '100000000000000000000',
        buyAmount: '5000000000',
        kind: 'sell',
      } as unknown as SwapOrder

      const result = getFilledPercentage(mockOrder)

      expect(result).toEqual('10')
    })

    it('returns 0 if the executed amount is below 1%', () => {
      const mockOrder = {
        executedSellAmount: '10000000000000000000',
        executedBuyAmount: '50',
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '100000000000000000000',
        buyAmount: '5000000000',
        kind: 'buy',
      } as unknown as SwapOrder

      const result = getFilledPercentage(mockOrder)

      expect(result).toEqual('0')
    })

    // eslint-disable-next-line no-only-tests/no-only-tests
    it('returns the surplus amount for buy orders', () => {
      const mockOrder = {
        executedSellAmount: '10000000000000000000', //10
        executedBuyAmount: '50',
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '15000000000000000000', //15
        buyAmount: '5000000000',
        kind: 'buy',
      } as unknown as SwapOrder

      const result = getSurplusPrice(mockOrder)

      expect(result).toEqual(5)
    })

    it('returns the surplus amount for sell orders', () => {
      const mockOrder = {
        executedSellAmount: '100000000000000000000',
        executedBuyAmount: '10000000000', //100
        buyToken: { decimals: 8 },
        sellToken: { decimals: 18 },
        sellAmount: '100000000000000000000',
        buyAmount: '5000000000', //50
        kind: 'sell',
      } as unknown as SwapOrder

      const result = getSurplusPrice(mockOrder)

      expect(result).toEqual(50)
    })
  })

  describe('isOrderPartiallyFilled', () => {
    it('returns true if a buy order is partially filled', () => {
      const mockOrder = {
        executedBuyAmount: '10',
        buyAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '50000000000000000000', // 50 tokens
        sellAmount: '100000000000000000000', // 100 tokens
        kind: 'buy',
      } as unknown as SwapOrder

      const result = isOrderPartiallyFilled(mockOrder)

      expect(result).toBe(true)
    })

    it('returns false if a buy order is not fully filled or fully filled', () => {
      const mockOrder = {
        executedBuyAmount: '0',
        buyAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '100000000000000000000', // 100 tokens
        sellAmount: '100000000000000000000', // 100 tokens
        kind: 'buy',
      } as unknown as SwapOrder

      const result = isOrderPartiallyFilled(mockOrder)

      expect(result).toBe(false)

      const result1 = isOrderPartiallyFilled({
        ...mockOrder,
        executedBuyAmount: '100000000000000000000', // 100 tokens
      })
      expect(result1).toBe(false)
    })

    it('returns true if a sell order is partially filled', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000',
        executedSellAmount: '10',
        executedBuyAmount: '50000000000000000000', // 50 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'sell',
      } as unknown as SwapOrder

      const result = isOrderPartiallyFilled(mockOrder)

      expect(result).toBe(true)
    })

    it('returns false if a sell order is not fully filled or fully filled', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000',
        executedSellAmount: '0',
        executedBuyAmount: '100000000000000000000', // 100 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'sell',
      } as unknown as SwapOrder

      const result = isOrderPartiallyFilled(mockOrder)

      expect(result).toBe(false)

      const result1 = isOrderPartiallyFilled({
        ...mockOrder,
        executedSellAmount: '100000000000000000000', // 100 tokens
      })

      expect(result1).toBe(false)
    })
  })
})

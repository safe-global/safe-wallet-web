import {
  getExecutionPrice,
  getFilledPercentage,
  getLimitPrice,
  getPartiallyFilledSurplus,
  getSurplusPrice,
  isOrderPartiallyFilled,
  isSettingTwapFallbackHandler,
  TWAP_FALLBACK_HANDLER,
} from '../utils'
import type { DecodedDataResponse, TwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { type SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { calculateSingleOrderHash } from '../utils'
import type { TransactionData } from '@safe-global/safe-apps-sdk'

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

  test('twap order with unknown executed sell and buy amounts', () => {
    const mockOrder = {
      executedSellAmount: null,
      executedBuyAmount: null,
      buyToken: { decimals: 8 },
      sellToken: { decimals: 18 },
      sellAmount: '100000000000000000000',
      buyAmount: '5000000000',
    } as unknown as TwapOrder

    const executionPrice = getExecutionPrice(mockOrder)
    const limitPrice = getLimitPrice(mockOrder)
    const surplusPrice = getSurplusPrice(mockOrder)

    expect(executionPrice).toBe(0)
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
  describe('getPartiallyFilledSurplusPrice', () => {
    it('returns 0 for partially filled sell order with no surplus', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '50000000000000000000', // 50 tokens
        executedBuyAmount: '50000000000000000000', // 50 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'sell',
        buyToken: { decimals: 18 },
        sellToken: { decimals: 18 },
      } as unknown as SwapOrder

      const result = getPartiallyFilledSurplus(mockOrder)

      expect(result).toEqual(0)
    })
    it('returns 0 for partially filled buy order with no surplus', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '50000000000000000000', // 50 tokens
        executedBuyAmount: '50000000000000000000', // 50 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'buy',
        buyToken: { decimals: 18 },
        sellToken: { decimals: 18 },
      } as unknown as SwapOrder

      const result = getPartiallyFilledSurplus(mockOrder)

      expect(result).toEqual(0)
    })
    it('returns surplus for partially filled sell orders', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '50000000000000000000', // 50 tokens
        executedBuyAmount: '55000000000000000000', // 55 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'sell',
        buyToken: { decimals: 18 },
        sellToken: { decimals: 18 },
      } as unknown as SwapOrder

      const result = getPartiallyFilledSurplus(mockOrder)
      expect(result).toEqual(5)
    })
    it('returns surplus for partially filled buy orders', () => {
      const mockOrder = {
        sellAmount: '100000000000000000000', // 100 tokens
        executedSellAmount: '45000000000000000000', // 50 tokens
        executedBuyAmount: '50000000000000000000', // 55 tokens
        buyAmount: '100000000000000000000', // 100 tokens
        kind: 'buy',
        buyToken: { decimals: 18 },
        sellToken: { decimals: 18 },
      } as unknown as SwapOrder

      const result = getPartiallyFilledSurplus(mockOrder)

      expect(result).toEqual(5)
    })
  })

  describe('isSettingTwapFallbackHandler', () => {
    it('should return true when handler is TWAP_FALLBACK_HANDLER', () => {
      const decodedData = {
        parameters: [
          {
            valueDecoded: [
              {
                dataDecoded: {
                  method: 'setFallbackHandler',
                  parameters: [{ name: 'handler', value: TWAP_FALLBACK_HANDLER }],
                },
              },
            ],
          },
        ],
      } as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(true)
    })

    it('should return false when handler is not TWAP_FALLBACK_HANDLER', () => {
      const decodedData = {
        parameters: [
          {
            valueDecoded: [
              {
                dataDecoded: {
                  method: 'setFallbackHandler',
                  parameters: [{ name: 'handler', value: '0xDifferentHandler' }],
                },
              },
            ],
          },
        ],
      } as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(false)
    })

    it('should return false when method is not setFallbackHandler', () => {
      const decodedData = {
        parameters: [
          {
            valueDecoded: [
              {
                dataDecoded: {
                  method: 'differentMethod',
                  parameters: [{ name: 'handler', value: TWAP_FALLBACK_HANDLER }],
                },
              },
            ],
          },
        ],
      } as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(false)
    })

    it('should return false when decodedData is undefined', () => {
      expect(isSettingTwapFallbackHandler(undefined)).toBe(false)
    })

    it('should return false when parameters are missing', () => {
      const decodedData = {} as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(false)
    })

    it('should return false when valueDecoded is missing', () => {
      const decodedData = {
        parameters: [
          {
            valueDecoded: null,
          },
        ],
      } as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(false)
    })

    it('should return false when dataDecoded is missing', () => {
      const decodedData = {
        parameters: [
          {
            valueDecoded: [
              {
                dataDecoded: null,
              },
            ],
          },
        ],
      } as unknown as DecodedDataResponse
      expect(isSettingTwapFallbackHandler(decodedData)).toBe(false)
    })
  })

  describe('calculateSingleOrderHash', () => {
    it('returns undefined if txData is undefined', () => {
      expect(calculateSingleOrderHash(undefined)).toBeUndefined()
    })

    it('returns undefined if txData.hexData is undefined', () => {
      const txData = { hexData: undefined } as TransactionData
      expect(calculateSingleOrderHash(txData)).toBeUndefined()
    })

    it('retturns correct hash for multi-send calldata ', () => {
      const txData = {
        hexData:
          '0x8d80ff0a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003cb0031eac7f0141837b266de30f4dc9af15629bd538100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024f08a03230000000000000000000000002f55e8b20d0b9fefa187aa7d00b6cbe563605bf50031eac7f0141837b266de30f4dc9af15629bd5381000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000443365582cdaee378bd0eb30ddf479272accf91761e697bc00e067a268f95f1d2732ed230b000000000000000000000000fdafc9d1902f4e0b84f65f49f244b32b31013b7400fdafc9d1902f4e0b84f65f49f244b32b31013b74000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002640d0d9800000000000000000000000000000000000000000000000000000000000000008000000000000000000000000052ed56da04309aca4c3fecc595298d80c2f16bac000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a5000000000000000000000000000000000000000000000000000000190e52edcb00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000be72e441bf55620febc26715db68d3494213d8cb00000000000000000000000031eac7f0141837b266de30f4dc9af15629bd53810000000000000000000000000000000000000000000000000530055ba4217203000000000000000000000000000000000000000000000007a44efd8d857aa9e700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000000007eda228d5bb9d713863d5bfa596eeb9c8fa7c9da9d4ca889e1457b0cb30010a60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        to: {
          value: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
          name: 'Safe: MultiSendCallOnly 1.3.0',
        },
        value: '0',
      } as unknown as TransactionData

      const hash = calculateSingleOrderHash(txData)

      expect(hash).toEqual('0x7a0faa34057710bbeefe6947df3bc72c8fe438ba4c79a2eddad6949425102004')
    })

    it('returns undefined if createWithContextParams is not found', () => {
      const txData = { hexData: '0x123', to: '0x456', value: '0x789' } as unknown as TransactionData
      expect(calculateSingleOrderHash(txData)).toBeUndefined()
    })

    it('returns the correct hash if tx-data is createWithContext call', () => {
      const txData = {
        hexData:
          '0x0d0d9800000000000000000000000000000000000000000000000000000000000000008000000000000000000000000052ed56da04309aca4c3fecc595298d80c2f16bac000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a5000000000000000000000000000000000000000000000000000000190e49d9c200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000be72e441bf55620febc26715db68d3494213d8cb00000000000000000000000031eac7f0141837b266de30f4dc9af15629bd53810000000000000000000000000000000000000000000000000530055ba42172030000000000000000000000000000000000000000000000076a339a32b3e8cd2b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000384000000000000000000000000000000000000000000000000000000000000000096d6f58d27a38d2d2956bec8afc6b11cf64210836f6908a8226af01f824f090b0000000000000000000000000000000000000000000000000000000000000000',
        to: {
          value: '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74',
          name: 'ComposableCoW',
        },
        value: '0',
      } as unknown as TransactionData

      const hash = calculateSingleOrderHash(txData)

      expect(hash).toEqual('0xdd68da3eb556b7a3e34edcf467955a716e37fe98223caefa0850cdd3a5c609a4')
    })
  })
})

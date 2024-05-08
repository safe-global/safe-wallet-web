import type { SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { formatUnits } from 'ethers'
import type { AnyAppDataDocVersion, latest } from '@cowprotocol/app-data'

type Quantity = {
  amount: string | number | bigint
  decimals: number
}

enum OrderKind {
  SELL = 'sell',
  BUY = 'buy',
}

function calculateDifference(amountA: string, amountB: string, decimals: number): number {
  return asDecimal(BigInt(amountA), decimals) - asDecimal(BigInt(amountB), decimals)
}

function asDecimal(amount: number | bigint, decimals: number): number {
  return Number(formatUnits(amount, decimals))
}

export const getExecutionPrice = (
  order: Pick<SwapOrder, 'executedSellAmount' | 'executedBuyAmount' | 'buyToken' | 'sellToken'>,
): number => {
  const { executedSellAmount, executedBuyAmount, buyToken, sellToken } = order

  const ratio = calculateRatio(
    { amount: executedSellAmount, decimals: sellToken.decimals },
    {
      amount: executedBuyAmount,
      decimals: buyToken.decimals,
    },
  )

  return ratio
}

export const getLimitPrice = (
  order: Pick<SwapOrder, 'sellAmount' | 'buyAmount' | 'buyAmount' | 'buyToken' | 'sellToken'>,
): number => {
  const { sellAmount, buyAmount, buyToken, sellToken } = order

  const ratio = calculateRatio(
    { amount: sellAmount, decimals: sellToken.decimals },
    {
      amount: buyAmount,
      decimals: buyToken.decimals,
    },
  )

  return ratio
}

const calculateRatio = (a: Quantity, b: Quantity) => {
  return asDecimal(BigInt(a.amount), a.decimals) / asDecimal(BigInt(b.amount), b.decimals)
}

export const getSurplusPrice = (
  order: Pick<
    SwapOrder,
    'executedBuyAmount' | 'buyAmount' | 'buyToken' | 'executedSellAmount' | 'sellAmount' | 'sellToken' | 'kind'
  >,
): number => {
  const { kind, executedSellAmount, sellAmount, sellToken, executedBuyAmount, buyAmount, buyToken } = order
  if (kind === OrderKind.BUY) {
    return calculateDifference(sellAmount, executedSellAmount, sellToken.decimals)
  } else if (kind === OrderKind.SELL) {
    return calculateDifference(executedBuyAmount, buyAmount, buyToken.decimals)
  } else {
    return 0
  }
}

export const getFilledPercentage = (
  order: Pick<SwapOrder, 'executedBuyAmount' | 'kind' | 'buyAmount' | 'executedSellAmount' | 'sellAmount'>,
): string => {
  let executed: number
  let total: number

  if (order.kind === OrderKind.BUY) {
    executed = Number(order.executedBuyAmount)
    total = Number(order.buyAmount)
  } else if (order.kind === OrderKind.SELL) {
    executed = Number(order.executedSellAmount)
    total = Number(order.sellAmount)
  } else {
    return '0'
  }

  return ((executed / total) * 100).toFixed(0)
}

export const getFilledAmount = (
  order: Pick<SwapOrder, 'kind' | 'executedBuyAmount' | 'executedSellAmount' | 'buyToken' | 'sellToken'>,
): string => {
  if (order.kind === OrderKind.BUY) {
    return formatUnits(order.executedBuyAmount, order.buyToken.decimals)
  } else if (order.kind === OrderKind.SELL) {
    return formatUnits(order.executedSellAmount, order.sellToken.decimals)
  } else {
    return '0'
  }
}

export const getSlippageInPercent = (order: Pick<SwapOrder, 'fullAppData'>): string => {
  const fullAppData = order.fullAppData as AnyAppDataDocVersion
  const slippageBips = (fullAppData?.metadata?.quote as latest.Quote)?.slippageBips || 0

  return (Number(slippageBips) / 100).toFixed(2)
}

export const getOrderClass = (order: Pick<SwapOrder, 'fullAppData'>): latest.OrderClass1 => {
  const fullAppData = order.fullAppData as AnyAppDataDocVersion
  const orderClass = (fullAppData?.metadata?.orderClass as latest.OrderClass)?.orderClass

  return orderClass || 'market'
}

export const isOrderPartiallyFilled = (
  order: Pick<SwapOrder, 'executedBuyAmount' | 'executedSellAmount' | 'sellAmount' | 'buyAmount' | 'kind'>,
): boolean => {
  const executedBuyAmount = BigInt(order.executedBuyAmount)
  const buyAmount = BigInt(order.buyAmount)
  const executedSellAmount = BigInt(order.executedSellAmount)
  const sellAmount = BigInt(order.sellAmount)

  if (order.kind === OrderKind.BUY) {
    return executedBuyAmount !== 0n && executedBuyAmount < buyAmount
  }

  return BigInt(executedSellAmount) !== 0n && executedSellAmount < sellAmount
}

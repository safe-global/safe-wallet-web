import type { SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { formatUnits } from 'ethers'
import type { AnyAppDataDocVersion, latest } from '@cowprotocol/app-data'

type Quantity = {
  amount: string | number | bigint
  decimals: number
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

export const getSurplusPrice = (order: Pick<SwapOrder, 'executedBuyAmount' | 'buyAmount' | 'buyToken'>): number => {
  const { executedBuyAmount, buyAmount, buyToken } = order

  const surplus =
    asDecimal(BigInt(executedBuyAmount), buyToken.decimals) - asDecimal(BigInt(buyAmount), buyToken.decimals)

  return surplus
}

export const getFilledPercentage = (
  order: Pick<SwapOrder, 'executedBuyAmount' | 'kind' | 'buyAmount' | 'executedSellAmount' | 'sellAmount'>,
): string => {
  let executed: number
  let total: number

  if (order.kind === 'buy') {
    executed = Number(order.executedBuyAmount)
    total = Number(order.buyAmount)
  } else if (order.kind === 'sell') {
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
  if (order.kind === 'buy') {
    return formatUnits(order.executedBuyAmount, order.buyToken.decimals)
  } else if (order.kind === 'sell') {
    return formatUnits(order.executedSellAmount, order.sellToken.decimals)
  } else {
    return '0'
  }
}

export const getSlippageInPercent = (order: Pick<SwapOrder, 'fullAppData'>): string => {
  const fullAppData = order.fullAppData as AnyAppDataDocVersion
  const slippageBips = (fullAppData.metadata.quote as latest.Quote).slippageBips || 0

  return (Number(slippageBips) / 100).toFixed(2)
}

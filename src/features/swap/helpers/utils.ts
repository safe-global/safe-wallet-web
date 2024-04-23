import type { SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { formatUnits } from 'ethers'

type Quantity = {
  amount: string | number | bigint
  decimals: number
}

function asDecimal(amount: number | bigint, decimals: number): number {
  return Number(formatUnits(amount, decimals))
}

type SwapOrderProps = Pick<
  SwapOrder,
  'executedBuyAmount' | 'executedSellAmount' | 'buyToken' | 'sellToken' | 'sellAmount' | 'buyAmount' | 'kind'
>
export const getExecutionPrice = (order: SwapOrderProps): number => {
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

export const getLimitPrice = (order: SwapOrderProps): number => {
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

export const getSurplusPrice = (order: SwapOrderProps): number => {
  const { executedBuyAmount, buyAmount, buyToken } = order

  const surplus =
    asDecimal(BigInt(executedBuyAmount), buyToken.decimals) - asDecimal(BigInt(buyAmount), buyToken.decimals)

  return surplus
}

export const getFilledPercentage = (order: SwapOrderProps): string => {
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

export const getFilledAmount = (order: SwapOrderProps): string => {
  if (order.kind === 'buy') {
    return formatUnits(order.executedBuyAmount, order.buyToken.decimals)
  } else if (order.kind === 'sell') {
    return formatUnits(order.executedSellAmount, order.sellToken.decimals)
  } else {
    return '0'
  }
}

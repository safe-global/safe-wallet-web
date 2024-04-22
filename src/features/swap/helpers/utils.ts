import type { SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import { formatUnits } from 'ethers'

type Quantity = {
  amount: string | number | bigint
  decimals: number
}

function asDecimal(amount: number | bigint, decimals: number): number {
  return Number(formatUnits(amount, decimals))
}

export const getExecutionPrice = (order: SwapOrder): number => {
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

export const getLimitPrice = (order: SwapOrder): number => {
  const { sellAmount, buyAmount, buyToken, sellToken } = order

  const ratio = calculateRatio(
    { amount: sellAmount, decimals: sellToken.decimals },
    {
      amount: buyAmount,
      decimals: buyToken.decimals,
    },
  )

  console.log('limit ratio', sellAmount, buyAmount, ratio)
  return ratio
}

const calculateRatio = (a: Quantity, b: Quantity) => {
  return asDecimal(BigInt(a.amount), a.decimals) / asDecimal(BigInt(b.amount), b.decimals)
}

export const getSurplusPrice = (order: SwapOrder): number => {
  const { executedBuyAmount, buyAmount, buyToken } = order

  const surplus =
    asDecimal(BigInt(executedBuyAmount), buyToken.decimals) - asDecimal(BigInt(buyAmount), buyToken.decimals)

  return surplus
}

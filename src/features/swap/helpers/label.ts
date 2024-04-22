import type { SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'

function asDecimal(amount: number | bigint, decimals: number): number {
  return Number(amount) / 10 ** decimals
}

export const getExecutionPrice = (order: SwapOrder): number => {
  const { executedSellAmount, executedBuyAmount, buyToken, sellToken } = order

  const ratio =
    asDecimal(BigInt(executedSellAmount), sellToken.decimals) / asDecimal(BigInt(executedBuyAmount), buyToken.decimals)

  return ratio
}

export const getLimitPrice = (order: SwapOrder): number => {
  const { sellAmount, buyAmount, buyToken, sellToken } = order

  const ratio = asDecimal(BigInt(sellAmount), sellToken.decimals) / asDecimal(BigInt(buyAmount), buyToken.decimals)

  return ratio
}

export const getSurplusPrice = (order: SwapOrder): number => {
  const { executedBuyAmount, buyAmount, buyToken } = order

  const surplus =
    asDecimal(BigInt(executedBuyAmount), buyToken.decimals) - asDecimal(BigInt(buyAmount), buyToken.decimals)

  return surplus
}

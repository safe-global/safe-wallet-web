import type { OnTradeParamsPayload } from '@cowprotocol/events'
import { stableCoinAddresses } from '@/features/swap/helpers/data/stablecoins'

/**
 * Function to calculate the fee % in bps to apply for a trade.
 * The fee % should be applied based on the fiat value of the buy or sell token.
 *
 * The current fee tiers are as follows:
 * === All tokens ===
 * 0 - 100k => 0.35%
 * 100k - 1m => 0.2%
 * 1m => 0.1%
 *
 * === Stable coins (both buy and sell tokens need to be stables)===
 * 0 - 100k => 0.1%
 * >100k - 1m => 0.07%
 * >1m => 0.05
 * @param orderParams
 */
export const calculateFeePercentageInBps = (orderParams: OnTradeParamsPayload) => {
  const { sellToken, buyToken, buyTokenFiatAmount, sellTokenFiatAmount, orderKind } = orderParams

  const isStableCoin = stableCoinAddresses[sellToken?.address] && stableCoinAddresses[buyToken?.address]

  const fiatAmount = Number(orderKind == 'sell' ? sellTokenFiatAmount : buyTokenFiatAmount) || 0

  if (fiatAmount < 100000) {
    return isStableCoin ? 10 : 35
  }

  if (fiatAmount < 1000000) {
    return isStableCoin ? 7 : 20
  }

  return isStableCoin ? 5 : 10
}

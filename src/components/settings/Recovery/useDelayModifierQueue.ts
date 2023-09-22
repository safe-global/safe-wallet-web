import type { Delay } from '@gnosis.pm/zodiac'

import useAsync from '@/hooks/useAsync'

export function useDelayModifierQueue(delayModifier: Delay) {
  return useAsync(async () => {
    const transactionAddedFilter = delayModifier.filters.TransactionAdded()
    const [txNonce, transactionAddedEvents] = await Promise.all([
      delayModifier.txNonce(),
      delayModifier.queryFilter(transactionAddedFilter),
    ])

    return transactionAddedEvents.slice(Number(txNonce))
  }, [delayModifier])
}

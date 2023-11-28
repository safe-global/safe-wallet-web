import { useCallback, useState } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'

import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useIntervalCounter from '@/hooks/useIntervalCounter'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import useTxHistory from '@/hooks/useTxHistory'
import { isCustomTxInfo, isMultiSendTxInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { sameAddress } from '@/utils/addresses'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '@/services/recovery/recovery-state'

const REFRESH_DELAY = 5 * 60 * 1_000 // 5 minutes

export function _shouldFetchRecoveryState(
  delayModifiers?: Array<Delay>,
  txHistory?: Array<TransactionListItem>,
): delayModifiers is Array<Delay> {
  if (!delayModifiers || delayModifiers.length === 0) {
    return false
  }

  // Transactions cleared on new Safe session
  if (!txHistory) {
    return true
  }

  const [latestTx] = txHistory.filter(isTransactionListItem)

  if (!latestTx) {
    return false
  }

  const { txInfo } = latestTx.transaction

  const isDelayModiferTx = delayModifiers.some((delayModifier) => {
    return isCustomTxInfo(txInfo) && sameAddress(txInfo.to.value, delayModifier.address)
  })

  // Multiple Delay Modifier settings changes are batched into a MultiSend
  return isDelayModiferTx || isMultiSendTxInfo(txInfo)
}

export function useRecoveryState(delayModifiers?: Array<Delay>): {
  data: AsyncResult<RecoveryState>
  refetch: () => void
} {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()
  const txHistory = useTxHistory()

  // Reload recovery data every REFRESH_DELAY
  const [counter] = useIntervalCounter(REFRESH_DELAY)

  // Reload recovery data when manually triggered
  const [refetchDep, setRefetchDep] = useState(false)
  const refetch = useCallback(() => {
    setRefetchDep((prev) => !prev)
  }, [])

  const data = useAsync<RecoveryState>(
    () => {
      if (
        _shouldFetchRecoveryState(delayModifiers, txHistory.page?.results) &&
        chain?.transactionService &&
        web3ReadOnly
      ) {
        return getRecoveryState({
          delayModifiers,
          transactionService: chain.transactionService,
          safeAddress,
          provider: web3ReadOnly,
          chainId: safe.chainId,
          version: safe.version,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      delayModifiers,
      counter,
      refetchDep,
      chain?.transactionService,
      web3ReadOnly,
      safeAddress,
      safe.chainId,
      safe.version,
      txHistory.page?.results,
    ],
    false,
  )

  return { data, refetch }
}

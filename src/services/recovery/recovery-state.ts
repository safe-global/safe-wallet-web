import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { BigNumber } from 'ethers'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import type { RecoveryQueueItem, RecoveryState } from '@/store/recoverySlice'

const MAX_PAGE_SIZE = 100

export const _getQueuedTransactionsAdded = (
  transactionsAdded: Array<TransactionAddedEvent>,
  txNonce: BigNumber,
): Array<TransactionAddedEvent> => {
  // Only queued transactions with queueNonce >= current txNonce
  return transactionsAdded.filter(({ args }) => args.queueNonce.gte(txNonce))
}

export const _getRecoveryQueueItem = async (
  transactionAdded: TransactionAddedEvent,
  txCooldown: BigNumber,
  txExpiration: BigNumber,
): Promise<RecoveryQueueItem> => {
  const txBlock = await transactionAdded.getBlock()

  const validFrom = BigNumber.from(txBlock.timestamp).add(txCooldown)
  const expiresAt = txExpiration.isZero()
    ? null // Never expires
    : validFrom.add(txExpiration)

  return {
    ...transactionAdded,
    timestamp: txBlock.timestamp,
    validFrom,
    expiresAt,
  }
}

export const getRecoveryState = async (delayModifier: Delay): Promise<RecoveryState[number]> => {
  const transactionAddedFilter = delayModifier.filters.TransactionAdded()

  const [[modules], txExpiration, txCooldown, txNonce, queueNonce, transactionsAdded] = await Promise.all([
    delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MAX_PAGE_SIZE),
    delayModifier.txExpiration(),
    delayModifier.txCooldown(),
    delayModifier.txNonce(),
    delayModifier.queueNonce(),
    delayModifier.queryFilter(transactionAddedFilter),
  ])

  const queuedTransactionsAdded = _getQueuedTransactionsAdded(transactionsAdded, txNonce)

  const queue = await Promise.all(
    queuedTransactionsAdded.map((transactionAdded) =>
      _getRecoveryQueueItem(transactionAdded, txCooldown, txExpiration),
    ),
  )

  return {
    address: delayModifier.address,
    modules,
    txExpiration,
    txCooldown,
    txNonce,
    queueNonce,
    queue,
  }
}

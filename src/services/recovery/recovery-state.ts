import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { BigNumber } from 'ethers'
import { memoize } from 'lodash'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

import type { RecoveryQueueItem, RecoveryState } from '@/store/recoverySlice'
import { hexZeroPad } from 'ethers/lib/utils'
import { trimTrailingSlash } from '@/utils/url'

const MAX_PAGE_SIZE = 100

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

export const _getSafeCreationReceipt = memoize(
  async ({
    transactionService,
    safeAddress,
    provider,
  }: {
    transactionService: string
    safeAddress: string
    provider: JsonRpcProvider
  }): Promise<TransactionReceipt> => {
    const url = `${trimTrailingSlash(transactionService)}/api/v1/safes/${safeAddress}/creation/`

    const { transactionHash } = await fetch(url).then((res) => {
      if (res.ok && res.status === 200) {
        return res.json() as Promise<{ transactionHash: string } & unknown>
      } else {
        throw new Error('Error fetching Safe creation details')
      }
    })

    return provider.getTransactionReceipt(transactionHash)
  },
  ({ transactionService, safeAddress }) => transactionService + safeAddress,
)

const queryAddedTransactions = async (
  delayModifier: Delay,
  queueNonce: BigNumber,
  txNonce: BigNumber,
  transactionService: string,
  provider: JsonRpcProvider,
  safeAddress: string,
) => {
  if (queueNonce.eq(txNonce)) {
    // There are no queued txs
    return []
  }

  const transactionAddedFilter = delayModifier.filters.TransactionAdded()

  if (transactionAddedFilter.topics) {
    // We filter for the valid nonces while fetching the event logs.
    // The nonce has to be one between the current queueNonce and the txNonce.
    const diff = queueNonce.sub(txNonce).toNumber()
    const queueNonceFilter = Array.from({ length: diff }, (_, idx) => hexZeroPad(txNonce.add(idx).toHexString(), 32))
    transactionAddedFilter.topics[1] = queueNonceFilter
  }

  const { blockNumber } = await _getSafeCreationReceipt({ transactionService, provider, safeAddress })

  return await delayModifier.queryFilter(transactionAddedFilter, blockNumber, 'latest')
}

export const getRecoveryState = async ({
  delayModifier,
  transactionService,
  safeAddress,
  provider,
}: {
  delayModifier: Delay
  transactionService: string
  safeAddress: string
  provider: JsonRpcProvider
}): Promise<RecoveryState[number]> => {
  const [[modules], txExpiration, txCooldown, txNonce, queueNonce] = await Promise.all([
    delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MAX_PAGE_SIZE),
    delayModifier.txExpiration(),
    delayModifier.txCooldown(),
    delayModifier.txNonce(),
    delayModifier.queueNonce(),
  ])

  const queuedTransactionsAdded = await queryAddedTransactions(
    delayModifier,
    queueNonce,
    txNonce,
    transactionService,
    provider,
    safeAddress,
  )

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

import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { memoize } from 'lodash'
import { getMultiSendCallOnlyDeployment } from '@safe-global/safe-deployments'
import { hexZeroPad } from 'ethers/lib/utils'
import type { BigNumber } from 'ethers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

import { trimTrailingSlash } from '@/utils/url'
import { sameAddress } from '@/utils/addresses'
import { isMultiSendCalldata } from '@/utils/transaction-calldata'
import { decodeMultiSendTxs } from '@/utils/transactions'
import type { RecoveryQueueItem, RecoveryState } from '@/store/recoverySlice'

export const MAX_GUARDIAN_PAGE_SIZE = 100

export function _isMaliciousRecovery({
  chainId,
  version,
  safeAddress,
  transaction,
}: {
  chainId: string
  version: SafeInfo['version']
  safeAddress: string
  transaction: Pick<TransactionAddedEvent['args'], 'to' | 'data'>
}) {
  const isMultiSend = isMultiSendCalldata(transaction.data)
  const transactions = isMultiSend ? decodeMultiSendTxs(transaction.data) : [transaction]

  if (!isMultiSend) {
    // Calling the Safe itself
    return !sameAddress(transaction.to, safeAddress)
  }

  const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId, version: version ?? undefined })

  if (!multiSendDeployment) {
    return true
  }

  const multiSendAddress = multiSendDeployment.networkAddresses[chainId] ?? multiSendDeployment.defaultAddress

  // Calling official MultiSend contract with a batch of transactions to the Safe itself
  return (
    !sameAddress(transaction.to, multiSendAddress) ||
    transactions.some((transaction) => !sameAddress(transaction.to, safeAddress))
  )
}

export const _getRecoveryQueueItemTimestamps = async ({
  delayModifier,
  transactionAdded,
  txCooldown,
  txExpiration,
}: {
  delayModifier: Delay
  transactionAdded: TransactionAddedEvent
  txCooldown: BigNumber
  txExpiration: BigNumber
}): Promise<Pick<RecoveryQueueItem, 'timestamp' | 'validFrom' | 'expiresAt'>> => {
  const timestamp = await delayModifier.txCreatedAt(transactionAdded.args.queueNonce)

  const validFrom = timestamp.add(txCooldown)
  const expiresAt = txExpiration.isZero()
    ? null // Never expires
    : validFrom.add(txExpiration).mul(1_000)

  return {
    timestamp: timestamp.mul(1_000),
    validFrom: validFrom.mul(1_000),
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

const getRecoveryQueueItem = async ({
  delayModifier,
  transactionAdded,
  txCooldown,
  txExpiration,
  provider,
  chainId,
  version,
  safeAddress,
}: {
  delayModifier: Delay
  transactionAdded: TransactionAddedEvent
  txCooldown: BigNumber
  txExpiration: BigNumber
  provider: JsonRpcProvider
  chainId: string
  version: SafeInfo['version']
  safeAddress: string
}): Promise<RecoveryQueueItem> => {
  const [timestamps, receipt] = await Promise.all([
    _getRecoveryQueueItemTimestamps({
      delayModifier,
      transactionAdded,
      txCooldown,
      txExpiration,
    }),
    provider.getTransactionReceipt(transactionAdded.transactionHash),
  ])

  const isMalicious = _isMaliciousRecovery({
    chainId,
    version,
    safeAddress,
    transaction: transactionAdded.args,
  })

  return {
    ...transactionAdded,
    ...timestamps,
    isMalicious,
    executor: receipt.from,
  }
}

export const getRecoveryState = async ({
  delayModifier,
  transactionService,
  safeAddress,
  provider,
  chainId,
  version,
}: {
  delayModifier: Delay
  transactionService: string
  safeAddress: string
  provider: JsonRpcProvider
  chainId: string
  version: SafeInfo['version']
}): Promise<RecoveryState[number]> => {
  const [[modules], txExpiration, txCooldown, txNonce, queueNonce] = await Promise.all([
    delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MAX_GUARDIAN_PAGE_SIZE),
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
    queuedTransactionsAdded.map((transactionAdded) => {
      return getRecoveryQueueItem({
        delayModifier,
        transactionAdded,
        txCooldown,
        txExpiration,
        provider,
        chainId,
        version,
        safeAddress,
      })
    }),
  )

  return {
    address: delayModifier.address,
    guardians: modules,
    txExpiration,
    txCooldown,
    txNonce,
    queueNonce,
    queue: queue.filter((item) => !item.removed),
  }
}

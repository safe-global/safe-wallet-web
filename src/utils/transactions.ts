import type {
  ChainInfo,
  ExecutionInfo,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  SafeAppData,
  SafeInfo,
  Transaction,
  TransactionDetails,
  TransactionListPage,
} from '@safe-global/safe-gateway-typescript-sdk'
import { ConflictType, getTransactionDetails, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isModuleDetailedExecutionInfo,
  isMultisigDetailedExecutionInfo,
  isMultisigExecutionInfo,
  isTransactionListItem,
  isTxQueued,
} from './transaction-guards'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types/dist/src/types'
import { OperationType } from '@safe-global/safe-core-sdk-types/dist/src/types'
import { getReadOnlyGnosisSafeContract } from '@/services/contracts/safeContracts'
import extractTxInfo from '@/services/tx/extractTxInfo'
import type { AdvancedParameters } from '@/components/tx/AdvancedParams'
import type { TransactionOptions, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { FEATURES, hasFeature } from '@/utils/chains'
import uniqBy from 'lodash/uniqBy'
import { Errors, logError } from '@/services/exceptions'

export const makeTxFromDetails = (txDetails: TransactionDetails): Transaction => {
  const getMissingSigners = ({
    signers,
    confirmations,
    confirmationsRequired,
  }: MultisigExecutionDetails): MultisigExecutionInfo['missingSigners'] => {
    if (confirmations.length >= confirmationsRequired) return

    const missingSigners = signers.filter(({ value }) => {
      const hasConfirmed = confirmations?.some(({ signer }) => signer?.value === value)
      return !hasConfirmed
    })

    return missingSigners.length ? missingSigners : undefined
  }

  const getMultisigExecutionInfo = ({
    detailedExecutionInfo,
  }: TransactionDetails): MultisigExecutionInfo | undefined => {
    if (!isMultisigDetailedExecutionInfo(detailedExecutionInfo)) return undefined

    return {
      type: detailedExecutionInfo.type,
      nonce: detailedExecutionInfo.nonce,
      confirmationsRequired: detailedExecutionInfo.confirmationsRequired,
      confirmationsSubmitted: detailedExecutionInfo.confirmations?.length || 0,
      missingSigners: getMissingSigners(detailedExecutionInfo),
    }
  }

  const executionInfo: ExecutionInfo | undefined = isModuleDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? (txDetails.detailedExecutionInfo as ExecutionInfo)
    : getMultisigExecutionInfo(txDetails)

  // Will only be used as a fallback whilst waiting on backend tx creation cache
  const now = Date.now()
  const timestamp = isTxQueued(txDetails.txStatus)
    ? isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
      ? txDetails.detailedExecutionInfo.submittedAt
      : now
    : txDetails.executedAt || now

  return {
    type: TransactionListItemType.TRANSACTION,
    transaction: {
      id: txDetails.txId,
      timestamp,
      txStatus: txDetails.txStatus,
      txInfo: txDetails.txInfo,
      executionInfo,
      safeAppInfo: txDetails?.safeAppInfo,
    },
    conflictType: ConflictType.NONE,
  }
}

const getSignatures = (confirmations: Record<string, string>) => {
  return Object.entries(confirmations)
    .filter(([_, signature]) => Boolean(signature))
    .sort(([signerA], [signerB]) => signerA.toLowerCase().localeCompare(signerB.toLowerCase()))
    .reduce((prev, [_, signature]) => {
      return prev + signature.slice(2)
    }, '0x')
}

export const getMultiSendTxs = (
  txs: TransactionDetails[],
  chain: ChainInfo,
  safeAddress: string,
  safeVersion: string,
): MetaTransactionData[] => {
  const readOnlySafeContract = getReadOnlyGnosisSafeContract(chain, safeVersion)

  return txs
    .map((tx) => {
      if (!isMultisigDetailedExecutionInfo(tx.detailedExecutionInfo)) return

      const args = extractTxInfo(tx, safeAddress)
      const sigs = getSignatures(args.signatures)

      const data = readOnlySafeContract.encode('execTransaction', [
        args.txParams.to,
        args.txParams.value,
        args.txParams.data,
        args.txParams.operation,
        args.txParams.safeTxGas,
        args.txParams.baseGas,
        args.txParams.gasPrice,
        args.txParams.gasToken,
        args.txParams.refundReceiver,
        sigs,
      ])

      return {
        operation: OperationType.Call,
        to: safeAddress,
        value: '0',
        data,
      }
    })
    .filter(Boolean) as MetaTransactionData[]
}

export const getTxsWithDetails = (txs: Transaction[], chainId: string) => {
  return Promise.all(
    txs.map(async (tx) => {
      return await getTransactionDetails(chainId, tx.transaction.id)
    }),
  )
}

export const getTxOptions = (params: AdvancedParameters, currentChain: ChainInfo | undefined): TransactionOptions => {
  const txOptions: TransactionOptions = {
    gasLimit: params.gasLimit?.toString(),
    maxFeePerGas: params.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: params.maxPriorityFeePerGas?.toString(),
    nonce: params.userNonce,
  }

  // Some chains don't support EIP-1559 gas price params
  if (currentChain && !hasFeature(currentChain, FEATURES.EIP1559)) {
    txOptions.gasPrice = txOptions.maxFeePerGas
    delete txOptions.maxFeePerGas
    delete txOptions.maxPriorityFeePerGas
  }

  return txOptions
}

export const getQueuedTransactionCount = (txPage?: TransactionListPage): string => {
  if (!txPage) {
    return '0'
  }

  const queuedTxs = txPage.results.filter(isTransactionListItem)

  const queuedTxsByNonce = uniqBy(queuedTxs, (item) =>
    isMultisigExecutionInfo(item.transaction.executionInfo) ? item.transaction.executionInfo.nonce : '',
  )

  if (txPage.next) {
    return `> ${queuedTxsByNonce.length}`
  }

  return queuedTxsByNonce.length.toString()
}

export const getTxOrigin = (app?: SafeAppData): string | undefined => {
  if (!app) {
    return
  }

  let origin: string | undefined

  try {
    origin = JSON.stringify({ name: app.name, url: app.url })
  } catch (e) {
    logError(Errors._808, (e as Error).message)
  }

  return origin
}

export const hasEnoughSignatures = (tx: SafeTransaction, safe: SafeInfo) => tx.signatures.size >= safe.threshold

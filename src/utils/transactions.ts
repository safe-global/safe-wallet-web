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
  TransactionSummary,
} from '@safe-global/safe-gateway-typescript-sdk'
import { ConflictType, getTransactionDetails, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isERC20Transfer,
  isModuleDetailedExecutionInfo,
  isMultisigDetailedExecutionInfo,
  isMultisigExecutionInfo,
  isTransactionListItem,
  isTransferTxInfo,
  isTxQueued,
} from './transaction-guards'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types/dist/src/types'
import { OperationType } from '@safe-global/safe-core-sdk-types/dist/src/types'
import { getReadOnlyGnosisSafeContract } from '@/services/contracts/safeContracts'
import extractTxInfo from '@/services/tx/extractTxInfo'
import type { AdvancedParameters } from '@/components/tx/AdvancedParams'
import type { SafeTransaction, TransactionOptions } from '@safe-global/safe-core-sdk-types'
import { FEATURES, hasFeature } from '@/utils/chains'
import uniqBy from 'lodash/uniqBy'
import { Errors, logError } from '@/services/exceptions'
import { Multi_send__factory } from '@/types/contracts'
import { toBeHex, AbiCoder } from 'ethers'
import { type BaseTransaction } from '@safe-global/safe-apps-sdk'
import { id } from 'ethers'
import { isEmptyHexData } from '@/utils/hex'

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

    return missingSigners.length > 0 ? missingSigners : undefined
  }

  const getMultisigExecutionInfo = ({
    detailedExecutionInfo,
  }: TransactionDetails): MultisigExecutionInfo | undefined => {
    if (!isMultisigDetailedExecutionInfo(detailedExecutionInfo)) return undefined

    return {
      type: detailedExecutionInfo.type,
      nonce: detailedExecutionInfo.nonce,
      confirmationsRequired: detailedExecutionInfo.confirmationsRequired,
      confirmationsSubmitted: detailedExecutionInfo.confirmations?.length ?? 0,
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
    : txDetails.executedAt ?? now

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

export const getMultiSendTxs = async (
  txs: TransactionDetails[],
  chain: ChainInfo,
  safeAddress: string,
  safeVersion: string,
): Promise<MetaTransactionData[]> => {
  const readOnlySafeContract = await getReadOnlyGnosisSafeContract(chain, safeVersion)

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

export const getTxOrigin = (app?: Partial<SafeAppData>): string | undefined => {
  if (!app) return

  const MAX_ORIGIN_LENGTH = 200
  const { url = '', name = '' } = app
  let origin: string | undefined

  try {
    // Must include empty string to avoid including the length of `undefined`
    const maxUrlLength = MAX_ORIGIN_LENGTH - JSON.stringify({ url: '', name: '' }).length
    const trimmedUrl = url.slice(0, maxUrlLength)

    const maxNameLength = Math.max(0, maxUrlLength - trimmedUrl.length)
    const trimmedName = name.slice(0, maxNameLength)

    origin = JSON.stringify({ url: trimmedUrl, name: trimmedName })
  } catch (e) {
    logError(Errors._808, e)
  }

  return origin
}

export const hasEnoughSignatures = (tx: SafeTransaction, safe: SafeInfo) => tx.signatures.size >= safe.threshold

const multiSendInterface = Multi_send__factory.createInterface()

const multiSendFragment = multiSendInterface.getFunction('multiSend')

const MULTISEND_SIGNATURE_HASH = id('multiSend(bytes)').slice(0, 10)

export const decodeSafeTxToBaseTransactions = (safeTx: SafeTransaction): BaseTransaction[] => {
  const txs: BaseTransaction[] = []
  const safeTxData = safeTx.data.data
  if (safeTxData.startsWith(MULTISEND_SIGNATURE_HASH)) {
    txs.push(...decodeMultiSendTxs(safeTxData))
  } else {
    txs.push({
      data: safeTxData,
      value: safeTx.data.value,
      to: safeTx.data.to,
    })
  }
  return txs
}

/**
 * TODO: Use core-sdk
 * Decodes the transactions contained in `multiSend` call data
 *
 * @param encodedMultiSendData `multiSend` call data
 * @returns array of individual transaction data
 */
export const decodeMultiSendTxs = (encodedMultiSendData: string): BaseTransaction[] => {
  // uint8 operation, address to, uint256 value, uint256 dataLength
  const INDIVIDUAL_TX_DATA_LENGTH = 2 + 40 + 64 + 64

  const [decodedMultiSendData] = multiSendInterface.decodeFunctionData(multiSendFragment, encodedMultiSendData)

  const txs: BaseTransaction[] = []

  // Decode after 0x
  let index = 2

  while (index < decodedMultiSendData.length) {
    const txDataEncoded = `0x${decodedMultiSendData.slice(
      index,
      // Traverse next transaction
      (index += INDIVIDUAL_TX_DATA_LENGTH),
    )}`

    // Decode operation, to, value, dataLength
    let txTo, txValue, txDataBytesLength
    try {
      ;[, txTo, txValue, txDataBytesLength] = AbiCoder.defaultAbiCoder().decode(
        ['uint8', 'address', 'uint256', 'uint256'],
        toBeHex(txDataEncoded, 32 * 4),
      )
    } catch (e) {
      logError(Errors._809, e)
      continue
    }

    // Each byte is represented by two characters
    const dataLength = Number(txDataBytesLength) * 2

    const txData = `0x${decodedMultiSendData.slice(
      index,
      // Traverse data length
      (index += dataLength),
    )}`

    txs.push({
      to: txTo,
      value: txValue.toString(),
      data: txData,
    })
  }

  return txs
}

export const isRejectionTx = (tx?: SafeTransaction) => {
  return !!tx && !!tx.data.data && isEmptyHexData(tx.data.data) && tx.data.value === '0'
}

export const isTrustedTx = (tx: TransactionSummary) => {
  return (
    isMultisigExecutionInfo(tx.executionInfo) ||
    isModuleDetailedExecutionInfo(tx.executionInfo) ||
    !isTransferTxInfo(tx.txInfo) ||
    !isERC20Transfer(tx.txInfo.transferInfo) ||
    Boolean(tx.txInfo.transferInfo.trusted)
  )
}

import type {
  ChainInfo,
  ExecutionInfo,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  SafeAppData,
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
import { getReadOnlyGnosisSafeContract, isValidMasterCopy } from '@/services/contracts/safeContracts'
import extractTxInfo from '@/services/tx/extractTxInfo'
import type { AdvancedParameters } from '@/components/tx/AdvancedParams'
import type { SafeTransaction, TransactionOptions } from '@safe-global/safe-core-sdk-types'
import { FEATURES, hasFeature } from '@/utils/chains'
import uniqBy from 'lodash/uniqBy'
import { Errors, logError } from '@/services/exceptions'
import { Safe_to_l2_migration__factory } from '@/types/contracts'
import { type BaseTransaction } from '@safe-global/safe-apps-sdk'
import { isEmptyHexData } from '@/utils/hex'
import { type ExtendedSafeInfo } from '@/store/safeInfoSlice'
import { getSafeContractDeployment } from '@/services/contracts/deployments'
import { sameAddress } from './addresses'
import { isMultiSendCalldata } from './transaction-calldata'
import { decodeMultiSendData } from '@safe-global/protocol-kit/dist/src/utils'
import { __unsafe_createMultiSendTx } from '@/services/tx/tx-sender'
import { getOriginPath } from './url'
import { getSafeToL2MigrationDeployment } from '@safe-global/safe-deployments'

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
      txHash: txDetails?.txHash || null,
    },
    conflictType: ConflictType.NONE,
  }
}

const getSignatures = (confirmations: Record<string, string>) => {
  return Object.entries(confirmations)
    .filter(([, signature]) => Boolean(signature))
    .sort(([signerA], [signerB]) => signerA.toLowerCase().localeCompare(signerB.toLowerCase()))
    .reduce((prev, [, signature]) => {
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

      // @ts-ignore
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
    const trimmedUrl = getOriginPath(url).slice(0, maxUrlLength)

    const maxNameLength = Math.max(0, maxUrlLength - trimmedUrl.length)
    const trimmedName = name.slice(0, maxNameLength)

    origin = JSON.stringify({ url: trimmedUrl, name: trimmedName })
  } catch (e) {
    logError(Errors._808, e)
  }

  return origin
}

export const decodeSafeTxToBaseTransactions = (safeTx: SafeTransaction): BaseTransaction[] => {
  const txs: BaseTransaction[] = []
  const safeTxData = safeTx.data.data
  if (isMultiSendCalldata(safeTxData)) {
    txs.push(...decodeMultiSendData(safeTxData))
  } else {
    txs.push({
      data: safeTxData,
      value: safeTx.data.value,
      to: safeTx.data.to,
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

export const isImitation = ({ txInfo }: TransactionSummary): boolean => {
  return isTransferTxInfo(txInfo) && isERC20Transfer(txInfo.transferInfo) && Boolean(txInfo.transferInfo.imitation)
}

/**
 *
 * If the Safe is using a invalid masterCopy this function will modify the passed in `safeTx` by making it a MultiSend that migrates the Safe to L2 as the first action.
 *
 * This only happens under the conditions that
 * - The Safe's nonce is 0
 * - The SafeTx's nonce is 0
 * - The Safe is using an invalid masterCopy
 * - The SafeTx is not already including a Migration
 *
 * @param safeTx original SafeTx
 * @param safe
 * @param chain
 * @returns
 */
export const prependSafeToL2Migration = (
  safeTx: SafeTransaction | undefined,
  safe: ExtendedSafeInfo,
  chain: ChainInfo | undefined,
): Promise<SafeTransaction | undefined> => {
  if (!chain) {
    throw new Error('No Network information available')
  }

  const safeL2Deployment = getSafeContractDeployment(chain, safe.version)
  const safeL2DeploymentAddress = safeL2Deployment?.networkAddresses[chain.chainId]
  const safeToL2MigrationDeployment = getSafeToL2MigrationDeployment({ network: chain.chainId })
  const safeToL2MigrationAddress = safeToL2MigrationDeployment?.networkAddresses[chain.chainId]

  if (
    !safeTx ||
    safeTx.signatures.size > 0 ||
    !chain.l2 ||
    safeTx.data.nonce > 0 ||
    isValidMasterCopy(safe.implementationVersionState) ||
    !safeToL2MigrationAddress ||
    !safeL2DeploymentAddress
  ) {
    // We do not migrate on L1s
    // We cannot migrate if the nonce is > 0
    // We do not modify already signed txs
    // We do not modify supported masterCopies
    // We cannot migrate if no migration contract or L2 contract exists
    return Promise.resolve(safeTx)
  }

  const safeToL2MigrationInterface = Safe_to_l2_migration__factory.createInterface()

  if (sameAddress(safe.implementation.value, safeL2DeploymentAddress)) {
    // Safe already has the correct L2 masterCopy
    // This should in theory never happen if the implementationState is valid
    return Promise.resolve(safeTx)
  }

  // If the Safe is a L1 masterCopy on a L2 network and still has nonce 0, we prepend a call to the migration contract to the safeTx.
  const txData = safeTx.data.data

  let internalTxs: MetaTransactionData[]
  if (isMultiSendCalldata(txData)) {
    // Check if the first tx is already a call to the migration contract
    internalTxs = decodeMultiSendData(txData)
  } else {
    internalTxs = [{ to: safeTx.data.to, operation: safeTx.data.operation, value: safeTx.data.value, data: txData }]
  }

  if (sameAddress(internalTxs[0]?.to, safeToL2MigrationAddress)) {
    // We already migrate. Nothing to do.
    return Promise.resolve(safeTx)
  }

  // Prepend the migration tx
  const newTxs: MetaTransactionData[] = [
    {
      operation: 1, // DELEGATE CALL REQUIRED
      data: safeToL2MigrationInterface.encodeFunctionData('migrateToL2', [safeL2DeploymentAddress]),
      to: safeToL2MigrationAddress,
      value: '0',
    },
    ...internalTxs,
  ]

  return __unsafe_createMultiSendTx(newTxs)
}

export const extractMigrationL2MasterCopyAddress = (safeTx: SafeTransaction | undefined): string | undefined => {
  if (!safeTx) {
    return undefined
  }

  if (!isMultiSendCalldata(safeTx.data.data)) {
    return undefined
  }

  const innerTxs = decodeMultiSendData(safeTx.data.data)
  const firstInnerTx = innerTxs[0]
  if (!firstInnerTx) {
    return undefined
  }

  const safeToL2MigrationDeployment = getSafeToL2MigrationDeployment()
  const safeToL2MigrationAddress = safeToL2MigrationDeployment?.defaultAddress
  const safeToL2MigrationInterface = Safe_to_l2_migration__factory.createInterface()

  if (
    firstInnerTx.data.startsWith(safeToL2MigrationInterface.getFunction('migrateToL2').selector) &&
    sameAddress(firstInnerTx.to, safeToL2MigrationAddress)
  ) {
    const callParams = safeToL2MigrationInterface.decodeFunctionData('migrateToL2', firstInnerTx.data)
    return callParams[0]
  }

  return undefined
}

export const getSafeTransaction = async (safeTxHash: string, chainId: string, safeAddress: string) => {
  const txId = `multisig_${safeAddress}_${safeTxHash}`

  try {
    return await getTransactionDetails(chainId, txId)
  } catch (e) {
    return undefined
  }
}
